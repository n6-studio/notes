import { Plural, useLingui } from "@lingui/react/macro";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { ImagePlus, Loader2 } from "lucide-react";
import {
  type ClipboardEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { TargetDatetimeButton } from "~/components/target-datetime-button";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { nextComposerFrameBox } from "~/lib/composer-frame-box";
import {
  submitNoteCaptureOverCrpc,
  submitNoteCaptureOverHttp,
} from "~/lib/convex/chat-composer-mutations";
import { useCRPC } from "~/lib/convex/crpc";
import { HOME_SAVE_LABEL_SIZER } from "~/lib/home-greeting";
import {
  isNoteLabel,
  NOTE_LABELS,
  type NoteLabel,
  NoteLabelSelectDisplay,
  noteLabelSelectFocusClass,
  noteLabelSelectItemAccentClass,
  noteLabelSurfaceClass,
} from "~/lib/note-label-styles";
import { cn } from "~/lib/utils";

const CAPTURE_TYPE_ITEMS = NOTE_LABELS.map((l) => ({
  label: l,
  value: l,
}));

const SELECT_SPIN_S = 18;
const HAS_WHITESPACE = /\s/;
const FIRST_NON_WHITESPACE_TOKEN = /^(\S+)/;

function firstTokenAfterTrimStart(text: string): string | undefined {
  const lead = text.trimStart();
  return FIRST_NON_WHITESPACE_TOKEN.exec(lead)?.[1];
}

/** If the whole trimmed message is one http(s) URL, return normalized href; else undefined. */
function singleHttpUrlFromCaptureText(text: string): string | undefined {
  const trimmed = text.trim();
  if (!trimmed || HAS_WHITESPACE.test(trimmed)) {
    return;
  }
  const withScheme =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return;
    }
    // Require a dot in hostname unless the user included an explicit scheme (e.g. http://localhost).
    const host = url.hostname;
    if (
      !(
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        host.includes(".")
      )
    ) {
      return;
    }
    return url.href;
  } catch {
    return;
  }
}

interface CaptureTypeSelectProps {
  onValueChange: (value: NoteLabel) => void;
  value: NoteLabel;
}

export function CaptureTypeSelect({
  value,
  onValueChange,
}: CaptureTypeSelectProps) {
  const { t } = useLingui();
  const labelPlaceholder = t`Label`;

  return (
    <Select
      items={CAPTURE_TYPE_ITEMS}
      onValueChange={(next) => {
        if (typeof next === "string" && isNoteLabel(next)) {
          onValueChange(next);
        }
      }}
      value={value}
    >
      <SelectTrigger
        aria-label={t`Capture type`}
        className={cn(
          "w-[min(132px,100%)] shrink-0 border-0 font-medium",
          noteLabelSurfaceClass(value),
          value === "note" && "text-muted-foreground",
          noteLabelSelectFocusClass(value)
        )}
        size="sm"
      >
        <SelectValue placeholder={labelPlaceholder}>
          {(selected: string | null) =>
            selected && isNoteLabel(selected) ? (
              <NoteLabelSelectDisplay label={selected} />
            ) : (
              labelPlaceholder
            )
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {NOTE_LABELS.map((l) => (
            <SelectItem
              className={noteLabelSelectItemAccentClass(l)}
              key={l}
              value={l}
            >
              <NoteLabelSelectDisplay label={l} />
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

interface ChatComposerProps {
  className?: string;
  onCreated?: () => void;
  /** Cycles the save verb. Title/placeholder stay as the SSR pick. */
  onCycleSaveLabel?: () => void;
  /** Runs at the start of submit (before uploads). Use for ensuring auth, etc. */
  onPreSubmit?: () => void | Promise<void>;
  placeholder: string;
  /** Companion-pair verb; always shown as-is, never replaced by a random CTA. */
  saveLabel: string;
  variant: "landing" | "home";
}

export function ChatComposer({
  variant,
  className,
  onCreated,
  onCycleSaveLabel,
  onPreSubmit,
  placeholder,
  saveLabel,
}: ChatComposerProps) {
  const { i18n, t } = useLingui();
  const router = useRouter();
  const crpc = useCRPC();
  const fileRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const accentGradId = `composer-accent-${useId().replaceAll(":", "")}`;
  const [frameBox, setFrameBox] = useState({ h: 0, rx: 18, w: 0 });
  const [body, setBody] = useState("");
  const [label, setLabel] = useState<NoteLabel>(NOTE_LABELS[0]);
  const [targetAtLocal, setTargetAtLocal] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const saveHoverArmedRef = useRef(false);
  const saveLabelShouldAnimateRef = useRef(false);
  const cycleSaveLabelRef = useRef(onCycleSaveLabel);
  cycleSaveLabelRef.current = onCycleSaveLabel;
  const bodyRef = useRef(body);
  bodyRef.current = body;

  const { mutateAsync: generateUploadUrl } = useMutation(
    crpc.notes.generateUploadUrl.mutationOptions()
  );
  const { mutateAsync: createNote } = useMutation(
    crpc.notes.create.mutationOptions()
  );
  useEffect(() => {
    const cycleCaptureType = (event: KeyboardEvent) => {
      if (!event.metaKey || event.repeat) {
        return;
      }
      if (event.key !== "." && event.code !== "Period") {
        return;
      }
      event.preventDefault();
      setLabel((current) => {
        const idx = NOTE_LABELS.indexOf(current);
        const i = idx >= 0 ? idx : 0;
        return NOTE_LABELS[(i + 1) % NOTE_LABELS.length];
      });
    };

    window.addEventListener("keydown", cycleCaptureType);
    return () => window.removeEventListener("keydown", cycleCaptureType);
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }

    const syncFrameBox = () => {
      const rect = frame.getBoundingClientRect();
      const rx = Number.parseFloat(getComputedStyle(frame).borderTopLeftRadius);
      setFrameBox((prev) => nextComposerFrameBox(prev, rect, rx));
    };

    const observer = new ResizeObserver(syncFrameBox);
    observer.observe(frame);
    syncFrameBox();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }

    const spinGradient = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }
      const spin = frame.querySelector(".composer-border-grad-spin");
      if (spin && "beginElement" in spin) {
        (spin as SVGAnimateTransformElement).beginElement();
      }
    };

    const resetGradient = () => {
      const spin = frame.querySelector(".composer-border-grad-spin");
      if (spin && "endElement" in spin) {
        try {
          (spin as SVGAnimateTransformElement).endElement();
        } catch {
          // Not running.
        }
      }
    };

    const onFocusIn = (event: FocusEvent) => {
      const from = event.relatedTarget;
      if (from instanceof Node && frame.contains(from)) {
        return;
      }
      spinGradient();
    };

    const onFocusOut = (event: FocusEvent) => {
      const to = event.relatedTarget;
      if (to instanceof Node && frame.contains(to)) {
        return;
      }
      if (bodyRef.current.trim().length > 0) {
        return;
      }
      resetGradient();
    };

    frame.addEventListener("focusin", onFocusIn);
    frame.addEventListener("focusout", onFocusOut);
    return () => {
      frame.removeEventListener("focusin", onFocusIn);
      frame.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  const onPickFiles = (list: FileList | null) => {
    if (!list?.length) {
      return;
    }
    setFiles((prev) => [...prev, ...Array.from(list)]);
  };

  const submit = async () => {
    setError(null);
    setPending(true);
    try {
      await onPreSubmit?.();

      const targetAt = targetAtLocal
        ? new Date(targetAtLocal).getTime()
        : undefined;

      const trimmedBody = body.trim();
      const linkUrl = singleHttpUrlFromCaptureText(trimmedBody);

      const payload = {
        body: trimmedBody,
        label,
        linkUrl,
        targetAt,
        files,
      };

      if (variant === "landing") {
        await submitNoteCaptureOverHttp(payload);
      } else {
        await submitNoteCaptureOverCrpc(payload, {
          generateUploadUrl: () => generateUploadUrl({}),
          createNote,
        });
      }

      setBody("");
      setTargetAtLocal("");
      setFiles([]);
      if (fileRef.current) {
        fileRef.current.value = "";
      }

      onCreated?.();
      await router.invalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : t`Something went wrong`);
    } finally {
      setPending(false);
    }
  };

  const canSend = body.trim().length > 0 || files.length > 0;
  const sendDisabled = !canSend || pending;
  const hasText = body.trim().length > 0;
  const borderInset = 0.5;
  const borderW = Math.max(0, frameBox.w - borderInset * 2);
  const borderH = Math.max(0, frameBox.h - borderInset * 2);
  const borderRx = Math.min(
    Math.max(0, frameBox.rx - borderInset),
    borderW / 2,
    borderH / 2
  );
  const borderCx = frameBox.w / 2;
  const borderCy = frameBox.h / 2;

  const onBodyKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.repeat) {
      return;
    }
    if (!(e.metaKey || e.ctrlKey)) {
      return;
    }
    e.preventDefault();
    if (sendDisabled) {
      return;
    }
    submit().catch(() => undefined);
  };

  const armSaveHover = () => {
    saveHoverArmedRef.current = true;
  };

  const releaseSaveHover = (event: { currentTarget: HTMLElement }) => {
    const el = event.currentTarget;
    requestAnimationFrame(() => {
      if (el.matches(":hover") || el.matches(":focus-visible")) {
        return;
      }
      if (!saveHoverArmedRef.current) {
        return;
      }
      saveHoverArmedRef.current = false;
      saveLabelShouldAnimateRef.current = true;
      cycleSaveLabelRef.current?.();
    });
  };

  const onBodyPaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    if (body.slice(0, start).trim() !== "") {
      return;
    }
    const merged = `${body.slice(0, start)}${e.clipboardData.getData("text")}${body.slice(end)}`;
    const first = firstTokenAfterTrimStart(merged);
    if (first && singleHttpUrlFromCaptureText(first)) {
      setLabel("link");
    }
  };

  return (
    <div
      className={cn(
        "composer-frame group relative rounded-2xl border border-border/60 bg-card/40 p-1 shadow-sm backdrop-blur-sm",
        hasText && "composer-frame-filled",
        className
      )}
      ref={frameRef}
    >
      {frameBox.w > 2 && frameBox.h > 2 ? (
        <svg
          aria-hidden="true"
          className="composer-border-light"
          preserveAspectRatio="none"
          viewBox={`0 0 ${frameBox.w} ${frameBox.h}`}
        >
          <defs>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id={accentGradId}
              x1={0}
              x2={frameBox.w}
              y1={borderCy}
              y2={borderCy}
            >
              <stop offset="0%" stopColor="oklch(0.76 0.22 312)" />
              <stop offset="50%" stopColor="oklch(0.72 0.2 248)" />
              <stop offset="100%" stopColor="oklch(0.76 0.22 312)" />
              <animateTransform
                attributeName="gradientTransform"
                begin="indefinite"
                calcMode="spline"
                className="composer-border-grad-spin"
                dur={`${SELECT_SPIN_S}s`}
                fill="freeze"
                keySplines="0.12 0.38 0.2 1"
                keyTimes="0;1"
                type="rotate"
                values={`0 ${borderCx} ${borderCy};360 ${borderCx} ${borderCy}`}
              />
            </linearGradient>
          </defs>
          <rect
            className="composer-border-accent"
            fill="none"
            height={borderH}
            rx={borderRx}
            stroke={`url(#${accentGradId})`}
            width={borderW}
            x={borderInset}
            y={borderInset}
          />
        </svg>
      ) : null}
      <div
        className={cn(
          "relative flex flex-col gap-3 p-3 sm:p-4",
          variant === "home" && "gap-4 p-4 sm:p-6"
        )}
      >
        <Textarea
          className={cn(
            "resize-none border-0 bg-transparent shadow-none focus-visible:ring-0",
            "text-base md:text-lg",
            variant === "home"
              ? "md:max-h:90 max-h-70 min-h-50 md:min-h-70"
              : "max-h-45 min-h-35 md:max-h-55 md:min-h-45"
          )}
          name="body"
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={onBodyKeyDown}
          onPaste={onBodyPaste}
          placeholder={placeholder}
          value={body}
        />
        {error ? (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            <CaptureTypeSelect onValueChange={setLabel} value={label} />

            <TargetDatetimeButton
              disabled={pending}
              onChange={setTargetAtLocal}
              value={targetAtLocal}
            />

            <div className="flex items-center gap-1">
              <input
                accept="image/*"
                className="hidden"
                multiple
                onChange={(e) => onPickFiles(e.target.files)}
                ref={fileRef}
                type="file"
              />
              <Button
                aria-label={t`Attach images`}
                disabled={pending}
                onClick={() => fileRef.current?.click()}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <ImagePlus className="text-muted-foreground" />
              </Button>
              {files.length > 0 ? (
                <span className="text-muted-foreground text-xs">
                  <Plural one="# image" other="# images" value={files.length} />
                </span>
              ) : null}
            </div>
          </div>

          <Button
            aria-label={saveLabel}
            className="composer-save relative shrink-0 overflow-visible"
            disabled={sendDisabled}
            onBlur={releaseSaveHover}
            onClick={() => {
              submit().catch(() => undefined);
            }}
            onFocus={armSaveHover}
            onPointerEnter={armSaveHover}
            onPointerLeave={releaseSaveHover}
            type="button"
          >
            <span aria-hidden className="composer-save-accent" />
            {pending ? (
              <Loader2 className="relative z-1 size-4 animate-spin" />
            ) : null}
            <span className="relative z-1 inline-grid justify-items-center">
              <span aria-hidden className="invisible col-start-1 row-start-1">
                {i18n._(HOME_SAVE_LABEL_SIZER)}
              </span>
              <span
                className={cn(
                  "col-start-1 row-start-1",
                  saveLabelShouldAnimateRef.current &&
                    "composer-save-label-swap"
                )}
                key={saveLabel}
              >
                {saveLabel}
              </span>
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}

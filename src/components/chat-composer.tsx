import { Plural, useLingui } from "@lingui/react/macro";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { ImagePlus, Loader2 } from "lucide-react";
import {
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { TargetDatetimeButton } from "~/components/target-datetime-button";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { nextComposerFrameBox } from "~/lib/composer-frame-box";
import {
  submitNoteCaptureOverCrpc,
  submitNoteCaptureOverHttp,
} from "~/lib/convex/chat-composer-mutations";
import { useCRPC } from "~/lib/convex/crpc";
import { HOME_SAVE_LABEL_SIZER } from "~/lib/home-greeting";
import { cn } from "~/lib/utils";

const SELECT_SPIN_S = 18;

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
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);
  const [frameEl, setFrameEl] = useState<HTMLDivElement | null>(null);
  const gradUid = useId().replaceAll(":", "");
  const accentGradId = `composer-accent-${gradUid}`;
  const hoverGradId = `composer-hover-${gradUid}`;
  const [frameBox, setFrameBox] = useState({ h: 0, rx: 18, w: 0 });
  const [body, setBody] = useState("");
  const [targetAtLocal, setTargetAtLocal] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [saveLabelShouldAnimate, setSaveLabelShouldAnimate] = useState(false);
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
    if (frameEl === null) {
      return;
    }

    const syncFrameBox = () => {
      const rect = frameEl.getBoundingClientRect();
      const rx = Number.parseFloat(
        getComputedStyle(frameEl).borderTopLeftRadius
      );
      setFrameBox((prev) => nextComposerFrameBox(prev, rect, rx));
    };

    const observer = new ResizeObserver(syncFrameBox);
    observer.observe(frameEl);
    syncFrameBox();
    return () => observer.disconnect();
  }, [frameEl]);

  useEffect(() => {
    if (frameEl === null) {
      return;
    }

    const beginSpin = (selector: string) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }
      const spin = frameEl.querySelector(selector);
      if (spin && "beginElement" in spin) {
        (spin as SVGAnimateTransformElement).beginElement();
      }
    };

    const endSpin = (selector: string) => {
      const spin = frameEl.querySelector(selector);
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
      if (from instanceof Node && frameEl.contains(from)) {
        return;
      }
      endSpin(".composer-border-hover-spin");
      beginSpin(".composer-border-grad-spin");
    };

    const onFocusOut = (event: FocusEvent) => {
      const to = event.relatedTarget;
      if (to instanceof Node && frameEl.contains(to)) {
        return;
      }
      if (bodyRef.current.trim().length > 0) {
        return;
      }
      endSpin(".composer-border-grad-spin");
      if (frameEl.matches(":hover")) {
        beginSpin(".composer-border-hover-spin");
      }
    };

    const onMouseEnter = () => {
      if (
        frameEl.matches(":focus-within") ||
        bodyRef.current.trim().length > 0
      ) {
        return;
      }
      beginSpin(".composer-border-hover-spin");
    };

    const onMouseLeave = () => {
      endSpin(".composer-border-hover-spin");
    };

    frameEl.addEventListener("focusin", onFocusIn);
    frameEl.addEventListener("focusout", onFocusOut);
    frameEl.addEventListener("mouseenter", onMouseEnter);
    frameEl.addEventListener("mouseleave", onMouseLeave);
    return () => {
      frameEl.removeEventListener("focusin", onFocusIn);
      frameEl.removeEventListener("focusout", onFocusOut);
      frameEl.removeEventListener("mouseenter", onMouseEnter);
      frameEl.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [frameEl]);

  const onPickFiles = useCallback((list: FileList | null) => {
    if (!list?.length) {
      return;
    }
    setFiles((prev) => [...prev, ...Array.from(list)]);
  }, []);

  const submit = useCallback(async () => {
    setError(null);
    setPending(true);
    try {
      await onPreSubmit?.();

      const targetAt = targetAtLocal
        ? new Date(targetAtLocal).getTime()
        : undefined;

      const payload = {
        body: body.trim(),
        files,
        targetAt,
      };

      if (variant === "landing") {
        await submitNoteCaptureOverHttp(payload);
      } else {
        await submitNoteCaptureOverCrpc(payload, {
          createNote,
          generateUploadUrl: () => generateUploadUrl({}),
        });
      }

      setBody("");
      setTargetAtLocal("");
      setFiles([]);
      if (fileInput !== null) {
        fileInput.value = "";
      }

      onCreated?.();
      await router.invalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : t`Something went wrong`);
    } finally {
      setPending(false);
    }
  }, [
    body,
    createNote,
    fileInput,
    files,
    generateUploadUrl,
    onCreated,
    onPreSubmit,
    router,
    t,
    targetAtLocal,
    variant,
  ]);

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

  const onBodyKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
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
    },
    [sendDisabled, submit]
  );

  const releaseSaveHover = useCallback(
    (event: { currentTarget: HTMLElement }) => {
      const el = event.currentTarget;
      requestAnimationFrame(() => {
        if (el.matches(":hover") || el.matches(":focus-visible")) {
          return;
        }
        setSaveLabelShouldAnimate(true);
        cycleSaveLabelRef.current?.();
      });
    },
    []
  );

  const onBodyChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setBody(event.target.value);
    },
    []
  );

  const onFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onPickFiles(event.target.files);
    },
    [onPickFiles]
  );

  const onAttachClick = useCallback(() => {
    fileInput?.click();
  }, [fileInput]);

  const onSaveClick = useCallback(() => {
    submit().catch(() => undefined);
  }, [submit]);

  return (
    <div
      className={cn(
        "composer-frame group relative rounded-2xl border border-border/60 bg-card/40 p-1 shadow-sm backdrop-blur-sm",
        hasText && "composer-frame-filled",
        className
      )}
      ref={setFrameEl}
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
              id={hoverGradId}
              x1={0}
              x2={frameBox.w}
              y1={borderCy}
              y2={borderCy}
            >
              <stop offset="0%" stopColor="var(--border)" />
              <stop offset="50%" stopColor="var(--muted)" />
              <stop offset="100%" stopColor="var(--border)" />
              <animateTransform
                attributeName="gradientTransform"
                begin="indefinite"
                calcMode="spline"
                className="composer-border-hover-spin"
                dur={`${SELECT_SPIN_S}s`}
                fill="freeze"
                keySplines="0.12 0.38 0.2 1"
                keyTimes="0;1"
                type="rotate"
                values={`0 ${borderCx} ${borderCy};360 ${borderCx} ${borderCy}`}
              />
            </linearGradient>
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
            className="composer-border-hover"
            fill="none"
            height={borderH}
            rx={borderRx}
            stroke={`url(#${hoverGradId})`}
            width={borderW}
            x={borderInset}
            y={borderInset}
          />
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
          onChange={onBodyChange}
          onKeyDown={onBodyKeyDown}
          placeholder={`${placeholder}...`}
          value={body}
        />
        {error ? (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
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
                onChange={onFileChange}
                ref={setFileInput}
                type="file"
              />
              <Button
                aria-label={t`Attach images`}
                disabled={pending}
                onClick={onAttachClick}
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
            onClick={onSaveClick}
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
                  saveLabelShouldAnimate && "composer-save-label-swap"
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

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";
import { ImagePlus, Loader2, SendHorizontal } from "lucide-react";
import {
  type ClipboardEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { TargetDatetimeButton } from "~/components/target-datetime-button";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { authClient } from "~/lib/convex/auth-client";
import { useCRPC } from "~/lib/convex/crpc";
import {
  NOTE_LABELS,
  NoteLabelSelectDisplay,
  noteLabelSelectFocusClass,
  noteLabelSelectItemAccentClass,
  noteLabelSurfaceClass,
} from "~/lib/note-label-styles";
import { cn } from "~/lib/utils";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const HAS_WHITESPACE = /\s/;
const FIRST_NON_WHITESPACE_TOKEN = /^(\S+)/;

function firstTokenAfterTrimStart(text: string): string | undefined {
  const lead = text.trimStart();
  return FIRST_NON_WHITESPACE_TOKEN.exec(lead)?.[1];
}

async function uploadNoteFiles(
  files: File[],
  getUploadPostUrl: () => Promise<string>
): Promise<Id<"_storage">[]> {
  const storageIds: Id<"_storage">[] = [];
  for (const file of files) {
    const postUrl = await getUploadPostUrl();
    const res = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) {
      throw new Error("Upload failed");
    }
    const json = (await res.json()) as { storageId: Id<"_storage"> };
    storageIds.push(json.storageId);
  }
  return storageIds;
}

async function createNoteViaHttp(params: {
  body: string;
  label: string;
  linkUrl: string | undefined;
  targetAt: number | undefined;
  files: File[];
}): Promise<void> {
  const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
  if (!convexUrl) {
    throw new Error("VITE_CONVEX_URL is not set");
  }
  const tokenRes = await authClient.convex.token({
    fetchOptions: { credentials: "include", throw: true },
  });
  const jwt = tokenRes.token;
  if (!jwt) {
    throw new Error("Could not get Convex session");
  }
  const httpClient = new ConvexHttpClient(convexUrl);
  httpClient.setAuth(jwt);

  const storageIds = await uploadNoteFiles(params.files, () =>
    httpClient.mutation(api.notes.generateUploadUrl, {})
  );

  await httpClient.mutation(api.notes.create, {
    body: params.body,
    label: params.label,
    linkUrl: params.linkUrl,
    targetAt: params.targetAt,
    storageIds: storageIds.length ? storageIds : undefined,
  });
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

interface ChatComposerProps {
  className?: string;
  onCreated?: () => void;
  /** Runs at the start of submit (before uploads). Use for ensuring auth, etc. */
  onPreSubmit?: () => void | Promise<void>;
  variant: "landing" | "home";
}

export function ChatComposer({
  variant,
  className,
  onCreated,
  onPreSubmit,
}: ChatComposerProps) {
  const router = useRouter();
  const crpc = useCRPC();
  const fileRef = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState("");
  const [label, setLabel] = useState<string>(NOTE_LABELS[0]);
  const [targetAtLocal, setTargetAtLocal] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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
        const idx = NOTE_LABELS.indexOf(
          current as (typeof NOTE_LABELS)[number]
        );
        const i = idx >= 0 ? idx : 0;
        return NOTE_LABELS[(i + 1) % NOTE_LABELS.length];
      });
    };

    window.addEventListener("keydown", cycleCaptureType);
    return () => window.removeEventListener("keydown", cycleCaptureType);
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

      if (variant === "landing") {
        await createNoteViaHttp({
          body: trimmedBody,
          label,
          linkUrl,
          targetAt,
          files,
        });
      } else {
        const storageIds = await uploadNoteFiles(files, () =>
          generateUploadUrl({})
        );

        await createNote({
          body: trimmedBody,
          label,
          linkUrl,
          targetAt,
          storageIds: storageIds.length ? storageIds : undefined,
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
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  };

  const canSend = body.trim().length > 0 || files.length > 0;
  const sendDisabled = !canSend || pending;

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
        "group rounded-2xl border border-border/60 bg-card/40 p-1 shadow-sm backdrop-blur-sm",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-3 p-3 sm:p-4",
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
          placeholder="Write anything. Text, a link, an idea…"
          value={body}
        />
        {error ? (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            <Select onValueChange={setLabel} value={label}>
              <SelectTrigger
                aria-label="Capture type"
                className={cn(
                  "w-[min(132px,100%)] shrink-0 border-0 font-medium",
                  noteLabelSurfaceClass(label),
                  label === "note" && "text-muted-foreground",
                  noteLabelSelectFocusClass(label)
                )}
                size="sm"
              >
                <SelectValue placeholder="Label" />
              </SelectTrigger>
              <SelectContent>
                {NOTE_LABELS.map((l) => (
                  <SelectItem
                    className={noteLabelSelectItemAccentClass(l)}
                    key={l}
                    value={l}
                  >
                    <NoteLabelSelectDisplay label={l} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
                aria-label="Attach images"
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
                  {files.length} image{files.length === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>
          </div>

          <Button
            className="shrink-0 gap-2"
            disabled={sendDisabled}
            onClick={() => {
              submit().catch(() => undefined);
            }}
            type="button"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <SendHorizontal className="size-4" />
            )}
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { ImagePlus, Loader2, SendHorizontal } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
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
import { cn } from "~/lib/utils";
import type { Id } from "../../convex/_generated/dataModel";

const LABELS = ["note", "reminder", "link", "idea"] as const;

interface ChatComposerProps {
  className?: string;
  onCreated?: () => void;
  variant: "landing" | "home";
}

export function ChatComposer({
  variant,
  className,
  onCreated,
}: ChatComposerProps) {
  const router = useRouter();
  const crpc = useCRPC();
  const fileRef = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState("");
  const [label, setLabel] = useState<string>(LABELS[0]);
  const [remindLocal, setRemindLocal] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const { mutateAsync: generateUploadUrl } = useMutation(
    crpc.notes.generateUploadUrl.mutationOptions()
  );
  const { mutateAsync: createNote } = useMutation(
    crpc.notes.create.mutationOptions()
  );
  const session = authClient.useSession();

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
      if (variant === "landing" && !session.data?.user) {
        await authClient.signIn.anonymous();
      }

      const storageIds: Id<"_storage">[] = [];
      for (const file of files) {
        const postUrl = await generateUploadUrl({});
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

      const remindAt = remindLocal
        ? new Date(remindLocal).getTime()
        : undefined;

      await createNote({
        body: body.trim(),
        label,
        remindAt,
        storageIds: storageIds.length ? storageIds : undefined,
      });

      setBody("");
      setRemindLocal("");
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

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card/40 p-1 shadow-sm backdrop-blur-sm",
        className
      )}
    >
      <div className="flex flex-col gap-3 p-3 sm:p-4">
        <Textarea
          className="min-h-[140px] resize-none border-0 bg-transparent text-base shadow-none focus-visible:ring-0 md:min-h-[180px]"
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write anything. Text, a link, a reminder…"
          value={body}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground uppercase tracking-wide">
                Type
              </Label>
              <Select onValueChange={setLabel} value={label}>
                <SelectTrigger className="h-9 bg-background/50">
                  <SelectValue placeholder="Label" />
                </SelectTrigger>
                <SelectContent>
                  {LABELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground uppercase tracking-wide">
                Remind
              </Label>
              <Input
                className="h-9 bg-background/50"
                onChange={(e) => setRemindLocal(e.target.value)}
                type="datetime-local"
                value={remindLocal}
              />
            </div>
          </div>
        </div>
        {error ? (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex items-center justify-between gap-2 border-border/50 border-t pt-3">
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
              <ImagePlus className="size-4" />
            </Button>
            {files.length > 0 ? (
              <span className="text-muted-foreground text-xs">
                {files.length} image{files.length === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
          <Button
            className="gap-2"
            disabled={
              !canSend ||
              pending ||
              (variant === "landing" && session.isPending)
            }
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
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useConvexAuth } from "convex/react";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function AttachmentImage({ storageId }: { storageId: Id<"_storage"> }) {
  const { isLoading: authLoading, isAuthenticated: convexAuthed } =
    useConvexAuth();
  const { data: url, isPending } = useQuery({
    ...convexQuery(
      api.notes.getAttachmentUrl,
      convexAuthed && !authLoading ? { storageId } : "skip"
    ),
  });

  if (isPending || !url) {
    return <Skeleton className="aspect-video w-full rounded-lg" />;
  }

  return (
    <a
      className="block overflow-hidden rounded-lg border border-border/50"
      href={url}
      rel="noreferrer"
      target="_blank"
    >
      <img
        alt=""
        className="max-h-80 w-full object-contain"
        height={320}
        src={url}
        width={480}
      />
    </a>
  );
}

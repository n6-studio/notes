import { useSuspenseQuery } from "@tanstack/react-query";
import { useConvexAuth } from "convex/react";
import { Suspense } from "react";
import { Skeleton } from "~/components/ui/skeleton";
import { useCRPC } from "~/lib/convex/crpc";
import type { Id } from "../../convex/_generated/dataModel";

function AttachmentSkeleton() {
  return <Skeleton className="aspect-video w-full rounded-lg" />;
}

function AttachmentImageReady({ storageId }: { storageId: Id<"_storage"> }) {
  const crpc = useCRPC();
  const { data: url } = useSuspenseQuery({
    ...crpc.notes.getAttachmentUrl.queryOptions(
      { storageId },
      { subscribe: false }
    ),
  });

  if (!url) {
    return <AttachmentSkeleton />;
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

/**
 * Convex auth–gated: children only mount the suspense query after the client reports signed-in state.
 */
function AttachmentGate({ storageId }: { storageId: Id<"_storage"> }) {
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  if (authLoading || !isAuthenticated) {
    return <AttachmentSkeleton />;
  }
  return (
    <Suspense fallback={<AttachmentSkeleton />}>
      <AttachmentImageReady storageId={storageId} />
    </Suspense>
  );
}

export function AttachmentImage({ storageId }: { storageId: Id<"_storage"> }) {
  return <AttachmentGate storageId={storageId} />;
}

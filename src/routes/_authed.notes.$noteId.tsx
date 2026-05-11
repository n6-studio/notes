import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import type { ReactElement } from "react";
import { AttachmentImage } from "~/components/attachment-image";
import { TopNav } from "~/components/top-nav";
import { Button } from "~/components/ui/button";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/_authed/notes/$noteId")({
  component: NoteDetail,
});

function NoteDetail() {
  const { noteId } = Route.useParams();
  const { isAuthenticated } = useRouteContext({ from: "__root__" });
  const { isLoading: authLoading, isAuthenticated: convexAuthed } =
    useConvexAuth();

  const { data, isPending, error } = useQuery({
    ...convexQuery(
      api.notes.get,
      convexAuthed && !authLoading ? { id: noteId as Id<"notes"> } : "skip"
    ),
  });

  let noteMain: ReactElement;
  if (isPending) {
    noteMain = <p className="text-muted-foreground text-sm">Loading…</p>;
  } else if (error || !data) {
    noteMain = <p className="text-destructive text-sm">Could not load note.</p>;
  } else {
    noteMain = (
      <article className="space-y-6">
        <header className="space-y-2 border-border/40 border-b pb-4">
          {data.note.label ? (
            <span className="inline-block rounded-full border border-border/50 px-2 py-0.5 text-[11px] text-muted-foreground">
              {data.note.label}
            </span>
          ) : null}
          <time
            className="text-muted-foreground text-xs"
            dateTime={new Date(data.note._creationTime).toISOString()}
          >
            {new Date(data.note._creationTime).toLocaleString()}
          </time>
          {data.note.linkUrl ? (
            <a
              className="block text-primary text-sm underline-offset-4 hover:underline"
              href={data.note.linkUrl}
              rel="noreferrer"
              target="_blank"
            >
              {data.note.linkUrl}
            </a>
          ) : null}
          {data.note.remindAt ? (
            <p className="text-muted-foreground text-xs">
              Reminder: {new Date(data.note.remindAt).toLocaleString()}
            </p>
          ) : null}
        </header>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {data.note.body}
        </p>
        {data.attachments.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.attachments.map((att) => (
              <AttachmentImage key={att._id} storageId={att.storageId} />
            ))}
          </div>
        ) : null}
      </article>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav isAuthenticated={isAuthenticated} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-8 pb-16">
        <Button asChild className="mb-6" size="sm" variant="ghost">
          <Link to="/notes">← Library</Link>
        </Button>
        {noteMain}
      </main>
    </div>
  );
}

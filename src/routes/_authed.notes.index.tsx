import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { useMemo, useState } from "react";
import { TopNav } from "~/components/top-nav";
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
import { cn } from "~/lib/utils";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/_authed/notes/")({
  component: NotesLibrary,
});

function NotesLibrary() {
  const { isAuthenticated } = useRouteContext({ from: "__root__" });
  const { isLoading: authLoading, isAuthenticated: convexAuthed } =
    useConvexAuth();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  const [day, setDay] = useState("");

  const bounds = useMemo(() => {
    if (!day) {
      return {};
    }
    const start = new Date(`${day}T00:00:00`);
    const end = new Date(`${day}T23:59:59.999`);
    return {
      dateFrom: start.getTime(),
      dateTo: end.getTime(),
    };
  }, [day]);

  const listArgs = useMemo(
    () => ({
      q: q.trim() || undefined,
      sort,
      ...bounds,
    }),
    [q, sort, bounds]
  );

  const { data: notes, isPending } = useQuery({
    ...convexQuery(
      api.notes.list,
      convexAuthed && !authLoading ? listArgs : "skip"
    ),
  });

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav isAuthenticated={isAuthenticated} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-8 pb-16">
        <div className="mb-8 flex flex-col gap-4 border-border/40 border-b pb-6">
          <h1 className="font-semibold text-xl tracking-tight">Notes</h1>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-[11px] text-muted-foreground uppercase tracking-wide">
                Search
              </Label>
              <Input
                className="h-9"
                onChange={(e) => setQ(e.target.value)}
                placeholder="Full-text search…"
                value={q}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground uppercase tracking-wide">
                Day
              </Label>
              <Input
                className="h-9"
                onChange={(e) => setDay(e.target.value)}
                type="date"
                value={day}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-3">
              <Label className="text-[11px] text-muted-foreground uppercase tracking-wide">
                Sort
              </Label>
              <Select
                onValueChange={(v) => setSort(v as "desc" | "asc")}
                value={sort}
              >
                <SelectTrigger className="h-9 w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest first</SelectItem>
                  <SelectItem value="asc">Oldest first</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isPending ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : (
          <ol className="relative border-border/50 border-s ps-4">
            {(notes ?? []).map((note, i) => (
              <li
                className="ms-2 mb-8"
                key={note._id}
                style={{ animationDelay: `${i * 25}ms` }}
              >
                <div
                  className={cn(
                    "absolute -start-[5px] mt-1.5 size-2 rounded-full",
                    "bg-muted-foreground/60"
                  )}
                />
                <Link
                  className="block rounded-lg border border-transparent p-3 transition-colors hover:border-border/60 hover:bg-card/30"
                  params={{ noteId: note._id }}
                  to="/notes/$noteId"
                >
                  <p className="line-clamp-3 text-sm leading-relaxed">
                    {note.body}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                    {note.label ? (
                      <span className="rounded-full border border-border/50 px-2 py-0.5">
                        {note.label}
                      </span>
                    ) : null}
                    <time dateTime={new Date(note._creationTime).toISOString()}>
                      {new Date(note._creationTime).toLocaleString()}
                    </time>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}

        {!isPending && (notes?.length ?? 0) === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nothing here yet. Start on the home page.
          </p>
        ) : null}

        <Button asChild className="mt-8" variant="outline">
          <Link to="/home">Back to capture</Link>
        </Button>
      </main>
    </div>
  );
}

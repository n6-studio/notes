import { skipToken, useMutation, useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  useRouteContext,
  useRouter,
} from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { Copy, MoreVerticalIcon, Trash2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import { TopNav } from "~/components/top-nav";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useCRPC } from "~/lib/convex/crpc";
import { noteLabelSurfaceClass } from "~/lib/note-label-styles";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/_authed/notes/")({
  component: NotesLibrary,
});

function NotesLibrary() {
  const { isAuthenticated } = useRouteContext({ from: "__root__" });
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated: convexAuthed } =
    useConvexAuth();
  const crpc = useCRPC();
  const removeNote = useMutation(crpc.notes.remove.mutationOptions());
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
    ...crpc.notes.list.queryOptions(
      convexAuthed && !authLoading ? listArgs : skipToken
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
                <div className="flex gap-2 rounded-lg border border-transparent p-3">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-3 text-sm leading-relaxed">
                      {note.body}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                      {note.label ? (
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 font-medium capitalize",
                            noteLabelSurfaceClass(note.label)
                          )}
                        >
                          {note.label}
                        </span>
                      ) : null}
                      <time
                        dateTime={new Date(note._creationTime).toISOString()}
                      >
                        {new Date(note._creationTime).toLocaleString()}
                      </time>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        aria-label="Note actions"
                        className="-me-1 -mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                      >
                        <MoreVerticalIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-40">
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onSelect={() => {
                            navigator.clipboard
                              .writeText(note.body)
                              .catch(() => {
                                /* ignore clipboard errors */
                              });
                          }}
                        >
                          <Copy />
                          Copy item
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={removeNote.isPending}
                          onSelect={() => {
                            removeNote.mutate(
                              { id: note._id },
                              {
                                onSettled: () => {
                                  router.invalidate().catch(() => {
                                    /* invalidate best-effort */
                                  });
                                },
                              }
                            );
                          }}
                          variant="destructive"
                        >
                          <Trash2Icon />
                          Delete item
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            ))}
          </ol>
        )}

        {!isPending && (notes?.length ?? 0) === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nothing here yet. Start on the home page.
          </p>
        ) : null}
      </main>
    </div>
  );
}

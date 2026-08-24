import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { Copy, MoreVerticalIcon, Trash2Icon } from "lucide-react";
import { type ReactNode, Suspense, useMemo, useState } from "react";
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useCRPC } from "~/lib/convex/crpc";
import {
  isNoteLabel,
  NOTE_LABELS,
  type NoteLabel,
  NoteLabelSelectDisplay,
  noteLabelMessage,
  noteLabelSelectItemAccentClass,
  noteLabelSurfaceClass,
} from "~/lib/note-label-styles";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/_authed/notes/")({
  component: NotesLibrary,
});

/** Normalized filters passed to `notes.list` once Convex auth is ready. */
interface NotesListInput {
  dateFrom?: number;
  dateTo?: number;
  label?: NoteLabel;
  q?: string;
  sort?: "desc" | "asc";
}

function NotesLibrary() {
  const { i18n, t } = useLingui();
  const { isLoading: authLoading, isAuthenticated: convexAuthed } =
    useConvexAuth();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  const [typeFilter, setTypeFilter] = useState<NoteLabel | "all">("all");
  const [day, setDay] = useState("");

  const typeFilterItems = [
    { label: t`All types`, value: "all" },
    ...NOTE_LABELS.map((label) => ({
      label: i18n._(noteLabelMessage(label)),
      value: label,
    })),
  ];
  const sortItems = [
    { label: t`Newest first`, value: "desc" },
    { label: t`Oldest first`, value: "asc" },
  ];

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

  const listArgs: NotesListInput = useMemo(
    () => ({
      q: q.trim() || undefined,
      sort,
      ...(typeFilter === "all" ? {} : { label: typeFilter }),
      ...bounds,
    }),
    [q, sort, typeFilter, bounds]
  );

  const listReady = convexAuthed && !authLoading;

  const emptyMain: ReactNode = (
    <p className="text-muted-foreground text-sm">
      <Trans>Nothing here yet. Start on the home page.</Trans>
    </p>
  );

  let listBody: ReactNode;
  if (listReady) {
    listBody = (
      <Suspense
        fallback={
          <p className="text-muted-foreground text-sm">
            <Trans>Loading…</Trans>
          </p>
        }
      >
        <NotesTimeline emptyMessage={emptyMain} listArgs={listArgs} />
      </Suspense>
    );
  } else {
    listBody = (
      <p className="text-muted-foreground text-sm">
        <Trans>Loading…</Trans>
      </p>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-8 pb-16">
        <div className="mb-8 flex flex-col gap-4 border-border/40 border-b pb-6">
          <h1 className="font-semibold text-xl tracking-tight">
            <Trans>Notes</Trans>
          </h1>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-[11px] text-muted-foreground uppercase tracking-wide">
                <Trans>Search</Trans>
              </Label>
              <Input
                className="h-9"
                onChange={(e) => setQ(e.target.value)}
                placeholder={t`Full-text search…`}
                value={q}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground uppercase tracking-wide">
                <Trans>Day</Trans>
              </Label>
              <Input
                className="h-9"
                onChange={(e) => setDay(e.target.value)}
                type="date"
                value={day}
              />
            </div>
            <div className="grid gap-3 sm:col-span-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  <Trans>Type</Trans>
                </Label>
                <Select
                  items={typeFilterItems}
                  onValueChange={(v) => {
                    if (v === null) {
                      return;
                    }
                    setTypeFilter(v === "all" ? "all" : (v as NoteLabel));
                  }}
                  value={typeFilter}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">
                        <Trans>All types</Trans>
                      </SelectItem>
                      {NOTE_LABELS.map((l) => (
                        <SelectItem
                          className={noteLabelSelectItemAccentClass(l)}
                          key={l}
                          value={l}
                        >
                          <span className="flex items-center gap-2">
                            <NoteLabelSelectDisplay label={l} />
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  <Trans>Sort</Trans>
                </Label>
                <Select
                  items={sortItems}
                  onValueChange={(v) => {
                    if (v === "desc" || v === "asc") {
                      setSort(v);
                    }
                  }}
                  value={sort}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="desc">
                        <Trans>Newest first</Trans>
                      </SelectItem>
                      <SelectItem value="asc">
                        <Trans>Oldest first</Trans>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {listBody}
      </main>
    </div>
  );
}

function NotesTimeline({
  emptyMessage,
  listArgs,
}: {
  emptyMessage: ReactNode;
  listArgs: NotesListInput;
}) {
  const router = useRouter();
  const { i18n, t } = useLingui();
  const crpc = useCRPC();
  const removeNote = useMutation(crpc.notes.remove.mutationOptions());
  const { data: notes } = useSuspenseQuery({
    ...crpc.notes.list.queryOptions(listArgs),
  });

  if (notes.length === 0) {
    return emptyMessage;
  }

  return (
    <ol className="relative border-border/50 border-s ps-4">
      {notes.map((note, i) => (
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
                {note.label && isNoteLabel(note.label) ? (
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 font-medium",
                      noteLabelSurfaceClass(note.label)
                    )}
                  >
                    {i18n._(noteLabelMessage(note.label))}
                  </span>
                ) : null}
                <time dateTime={new Date(note._creationTime).toISOString()}>
                  {new Date(note._creationTime).toLocaleString(i18n.locale)}
                </time>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    aria-label={t`Note actions`}
                    className="-me-1 -mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  />
                }
              >
                <MoreVerticalIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-40">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(note.body).catch(() => {
                        /* ignore clipboard errors */
                      });
                    }}
                  >
                    <Copy />
                    <Trans>Copy item</Trans>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled={removeNote.isPending}
                    onClick={() => {
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
                    <Trans>Delete item</Trans>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </li>
      ))}
    </ol>
  );
}

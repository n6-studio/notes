import { Plural, Trans, useLingui } from "@lingui/react/macro";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import {
  CalendarClock,
  Copy,
  Link2,
  MoreVerticalIcon,
  StickyNote,
  Trash2Icon,
} from "lucide-react";
import { useCallback } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import { useCRPC } from "~/lib/convex/crpc";
import {
  NOTE_LABEL_ICONS,
  noteLabelMessage,
  noteLabelSurfaceClass,
  resolveNoteLabel,
} from "~/lib/note-label-styles";
import { cn } from "~/lib/utils";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { singleHttpUrlFromText } from "../../convex/lib/note_type";

const TAP_SCALE =
  "transition-[scale] duration-150 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.96]";
const WWW_PREFIX = /^www\./;

export interface NotesListInput {
  dateFrom?: number;
  dateTo?: number;
  label?: "note" | "url";
  q?: string;
  sort?: "desc" | "asc";
}

export function NotesJournalSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-32 rounded-md" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  );
}

export function NotesCount({ listArgs }: { listArgs: NotesListInput }) {
  const crpc = useCRPC();
  const { data: notes } = useSuspenseQuery({
    ...crpc.notes.list.queryOptions(listArgs),
  });

  return (
    <p className="text-muted-foreground text-sm tabular-nums">
      <Plural one="# note" other="# notes" value={notes.length} />
    </p>
  );
}

export function NotesJournal({
  filtersActive,
  listArgs,
  onClearFilters,
}: {
  filtersActive: boolean;
  listArgs: NotesListInput;
  onClearFilters: () => void;
}) {
  const { i18n } = useLingui();
  const router = useRouter();
  const crpc = useCRPC();
  const removeNote = useMutation(crpc.notes.remove.mutationOptions());
  const { data: notes } = useSuspenseQuery({
    ...crpc.notes.list.queryOptions(listArgs),
  });

  if (notes.length === 0) {
    if (filtersActive) {
      return <NotesEmptyFiltered onClearFilters={onClearFilters} />;
    }
    return <NotesEmptyLibrary />;
  }

  const groups = groupNotesByDay(notes);

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <section key={group.dayKey}>
          <h2 className="mb-3 border-border/40 border-b pb-2 font-medium text-muted-foreground text-sm">
            {formatDayHeading(group.dayKey, i18n.locale)}
          </h2>
          <ol className="flex flex-col gap-2">
            {group.notes.map((note) => (
              <NoteJournalItem
                key={note._id}
                note={note}
                pendingDelete={removeNote.isPending}
                removeNote={removeNote}
                router={router}
              />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function NotesEmptyLibrary() {
  return (
    <Empty className="border border-border/40">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <StickyNote />
        </EmptyMedia>
        <EmptyTitle>
          <Trans>Nothing here yet</Trans>
        </EmptyTitle>
        <EmptyDescription>
          <Trans>Start on the home page.</Trans>
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button nativeButton={false} render={<Link to="/home" />}>
          <Trans>Go to Home</Trans>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

function NotesEmptyFiltered({
  onClearFilters,
}: {
  onClearFilters: () => void;
}) {
  return (
    <Empty className="border border-border/40">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <StickyNote />
        </EmptyMedia>
        <EmptyTitle>
          <Trans>No notes match</Trans>
        </EmptyTitle>
        <EmptyDescription>
          <Trans>Try a different search, type, or day.</Trans>
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onClearFilters} type="button" variant="outline">
          <Trans>Clear filters</Trans>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

function NoteJournalItem({
  note,
  pendingDelete,
  removeNote,
  router,
}: {
  note: Doc<"notes">;
  pendingDelete: boolean;
  removeNote: {
    mutate: (
      args: { id: Id<"notes"> },
      options: { onSettled: () => void }
    ) => void;
  };
  router: { invalidate: () => Promise<unknown> };
}) {
  const { i18n, t } = useLingui();

  const copyBody = useCallback(() => {
    navigator.clipboard.writeText(note.body).catch(() => {
      /* ignore clipboard errors */
    });
  }, [note.body]);

  const deleteNote = useCallback(() => {
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
  }, [note._id, removeNote, router]);

  const resolvedLabel = note.label ? resolveNoteLabel(note.label) : undefined;
  const href = noteHref(note);
  const hostname = href ? hostnameFromHref(href) : undefined;
  const LabelIcon = resolvedLabel ? NOTE_LABEL_ICONS[resolvedLabel] : undefined;

  return (
    <li>
      <div className="notes-entry flex gap-2 rounded-xl bg-card p-3">
        <div className="min-w-0 flex-1">
          {href ? (
            <a
              className="block text-foreground text-sm leading-relaxed underline-offset-4 hover:underline"
              href={href}
              rel="noreferrer"
              target="_blank"
            >
              <span className="inline-flex items-center gap-1.5">
                <Link2
                  aria-hidden
                  className="size-3.5 shrink-0"
                  strokeWidth={2}
                />
                <span className="min-w-0 truncate">{hostname ?? href}</span>
              </span>
            </a>
          ) : (
            <p className="line-clamp-3 text-sm leading-relaxed">{note.body}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            {resolvedLabel && LabelIcon ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium",
                  noteLabelSurfaceClass(resolvedLabel)
                )}
              >
                <LabelIcon aria-hidden className="size-3" strokeWidth={2} />
                {i18n._(noteLabelMessage(resolvedLabel))}
              </span>
            ) : null}
            {note.targetAt === undefined ? null : (
              <span className="inline-flex items-center gap-1">
                <CalendarClock aria-hidden className="size-3" strokeWidth={2} />
                <time dateTime={new Date(note.targetAt).toISOString()}>
                  {new Date(note.targetAt).toLocaleString(i18n.locale)}
                </time>
              </span>
            )}
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
                className={cn(
                  "-me-1 -mt-0.5 shrink-0 text-muted-foreground hover:text-foreground",
                  TAP_SCALE
                )}
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
              <DropdownMenuItem onClick={copyBody}>
                <Copy />
                <Trans>Copy item</Trans>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={pendingDelete}
                onClick={deleteNote}
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
  );
}

function noteHref(note: Doc<"notes">): string | undefined {
  if (note.linkUrl) {
    return note.linkUrl;
  }
  const resolved = note.label ? resolveNoteLabel(note.label) : undefined;
  if (resolved !== "url") {
    return;
  }
  return singleHttpUrlFromText(note.body);
}

function hostnameFromHref(href: string): string | undefined {
  try {
    return new URL(href).hostname.replace(WWW_PREFIX, "");
  } catch {
    return undefined;
  }
}

function localDayKey(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function groupNotesByDay(notes: Doc<"notes">[]) {
  const groups: { dayKey: string; notes: Doc<"notes">[] }[] = [];
  for (const note of notes) {
    const dayKey = localDayKey(note._creationTime);
    const last = groups.at(-1);
    if (last && last.dayKey === dayKey) {
      last.notes.push(note);
    } else {
      groups.push({ dayKey, notes: [note] });
    }
  }
  return groups;
}

function formatDayHeading(dayKey: string, locale: string): string {
  return new Date(`${dayKey}T00:00:00`).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    weekday: "long",
    year: "numeric",
  });
}

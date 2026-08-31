import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { Suspense, useCallback, useMemo, useState } from "react";
import { NotesFilters } from "~/components/notes-filters";
import {
  NotesCount,
  NotesJournal,
  NotesJournalSkeleton,
  type NotesListInput,
} from "~/components/notes-journal";
import { TopNav } from "~/components/top-nav";
import type { NoteType } from "~/lib/note-label-styles";

export const Route = createFileRoute("/_authed/notes/")({
  component: NotesLibrary,
});

function NotesLibrary() {
  const { isLoading: authLoading, isAuthenticated: convexAuthed } =
    useConvexAuth();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  const [typeFilter, setTypeFilter] = useState<NoteType | "all">("all");
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
  const filtersActive = Boolean(q.trim() || typeFilter !== "all" || day);

  const onClearFilters = useCallback(() => {
    setQ("");
    setTypeFilter("all");
    setDay("");
  }, []);

  const listBody = listReady ? (
    <Suspense fallback={<NotesJournalSkeleton />}>
      <NotesJournal
        filtersActive={filtersActive}
        listArgs={listArgs}
        onClearFilters={onClearFilters}
      />
    </Suspense>
  ) : (
    <NotesJournalSkeleton />
  );

  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <TopNav />
      <main className="relative mx-auto w-full max-w-4xl flex-1 px-4 pt-8 pb-[max(3rem,11vh)] md:pt-12 md:pb-[max(4.5rem,20vh)]">
        <div className="notes-enter notes-enter-title mb-6 flex items-baseline gap-3">
          <h1 className="hero-title font-semibold text-3xl tracking-tight md:text-4xl">
            <Trans>My notes</Trans>
          </h1>
          {listReady ? (
            <Suspense fallback={null}>
              <NotesCount listArgs={listArgs} />
            </Suspense>
          ) : null}
        </div>
        <div className="notes-enter notes-enter-toolbar mb-8">
          <NotesFilters
            day={day}
            onDayChange={setDay}
            onSearchChange={setQ}
            onSortChange={setSort}
            onTypeFilterChange={setTypeFilter}
            q={q}
            sort={sort}
            typeFilter={typeFilter}
          />
        </div>
        {listBody}
      </main>
    </div>
  );
}

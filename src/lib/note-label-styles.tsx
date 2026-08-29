import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react/macro";
import type { LucideIcon } from "lucide-react";
import { Lightbulb, Link2, ListTodo, StickyNote } from "lucide-react";

/** Computed note types — inferred from content, never chosen in the composer. */
export const NOTE_TYPES = ["note", "url"] as const;
export type NoteType = (typeof NOTE_TYPES)[number];

/** Stored labels we still know how to display, including pre-inference values. */
const DISPLAY_LABELS = ["note", "url", "todo", "idea"] as const;
export type NoteLabel = (typeof DISPLAY_LABELS)[number];

const NOTE_LABEL_MESSAGES: Record<NoteLabel, MessageDescriptor> = {
  idea: msg`Idea`,
  note: msg`Note`,
  todo: msg`Todo`,
  url: msg`URL`,
};

export function noteLabelMessage(label: NoteLabel): MessageDescriptor {
  return NOTE_LABEL_MESSAGES[label];
}

export const NOTE_LABEL_ICONS: Record<NoteLabel, LucideIcon> = {
  idea: Lightbulb,
  note: StickyNote,
  todo: ListTodo,
  url: Link2,
};

/** Icon + label text for SelectItem contents and SelectValue. */
export function NoteLabelSelectDisplay({
  label: labelKey,
}: {
  label: NoteLabel;
}) {
  const { i18n } = useLingui();
  const Icon = NOTE_LABEL_ICONS[labelKey];
  return (
    <>
      <Icon aria-hidden className="size-4 shrink-0 opacity-90" />
      <span>{i18n._(noteLabelMessage(labelKey))}</span>
    </>
  );
}

const SURFACE: Record<NoteLabel, string> = {
  idea: "border-fuchsia-200/45 bg-fuchsia-50/94 text-fuchsia-900/85 dark:border-fuchsia-400/20 dark:bg-fuchsia-950/26 dark:text-fuchsia-200",
  note: "border-border/80 bg-muted/90 text-foreground dark:border-border dark:bg-muted/55 dark:text-foreground",
  todo: "border-emerald-200/55 bg-emerald-50/93 text-emerald-900/88 dark:border-emerald-400/22 dark:bg-emerald-950/30 dark:text-emerald-200",
  url: "border-cyan-200/50 bg-cyan-50/92 text-cyan-800/95 dark:border-cyan-400/22 dark:bg-cyan-950/28 dark:text-cyan-200",
};

const SELECT_ITEM_ACCENT: Record<NoteLabel, string> = {
  idea: "data-highlighted:bg-fuchsia-100/45 data-highlighted:text-fuchsia-900 focus:bg-fuchsia-100/45 focus:text-fuchsia-900 data-selected:bg-fuchsia-100/30 data-selected:text-fuchsia-900 dark:data-highlighted:bg-fuchsia-950/38 dark:data-highlighted:text-fuchsia-200 dark:focus:bg-fuchsia-950/38 dark:focus:text-fuchsia-200 dark:data-selected:bg-fuchsia-950/26 dark:data-selected:text-fuchsia-200",
  note: "data-highlighted:bg-accent data-highlighted:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-selected:bg-muted data-selected:text-foreground dark:data-highlighted:bg-accent dark:data-highlighted:text-accent-foreground dark:focus:bg-accent dark:focus:text-accent-foreground dark:data-selected:bg-muted dark:data-selected:text-foreground",
  todo: "data-highlighted:bg-emerald-100/55 data-highlighted:text-emerald-900 focus:bg-emerald-100/55 focus:text-emerald-900 data-selected:bg-emerald-100/38 data-selected:text-emerald-900 dark:data-highlighted:bg-emerald-950/42 dark:data-highlighted:text-emerald-200 dark:focus:bg-emerald-950/42 dark:focus:text-emerald-200 dark:data-selected:bg-emerald-950/30 dark:data-selected:text-emerald-200",
  url: "data-highlighted:bg-cyan-100/50 data-highlighted:text-cyan-800 focus:bg-cyan-100/50 focus:text-cyan-800 data-selected:bg-cyan-100/35 data-selected:text-cyan-800 dark:data-highlighted:bg-cyan-950/40 dark:data-highlighted:text-cyan-200 dark:focus:bg-cyan-950/40 dark:focus:text-cyan-200 dark:data-selected:bg-cyan-950/30 dark:data-selected:text-cyan-200",
};

/** Map stored values onto display labels (`link` → `url`). */
export function resolveNoteLabel(value: string): NoteLabel | undefined {
  if (value === "link") {
    return "url";
  }
  if ((DISPLAY_LABELS as readonly string[]).includes(value)) {
    return value as NoteLabel;
  }
  return undefined;
}

/** Border + light background + text for triggers, badges, etc. */
export function noteLabelSurfaceClass(
  label: string | null | undefined
): string {
  const resolved = label ? resolveNoteLabel(label) : undefined;
  if (resolved) {
    return SURFACE[resolved];
  }
  return "border-border/60 bg-muted/40 text-muted-foreground";
}

/** Highlight / focus / selected state for type filter select items. */
export function noteLabelSelectItemAccentClass(label: NoteLabel): string {
  return SELECT_ITEM_ACCENT[label];
}

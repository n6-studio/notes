import type { LucideIcon } from "lucide-react";
import { Lightbulb, Link2, ListTodo, StickyNote } from "lucide-react";

/** Capture types / note labels — single source for UI + composer options. */
export const NOTE_LABELS = ["note", "todo", "link", "idea"] as const;
export type NoteLabel = (typeof NOTE_LABELS)[number];

/** Lucide icon per label (capture-type Select, etc.). */
export const NOTE_LABEL_ICONS: Record<NoteLabel, LucideIcon> = {
  note: StickyNote,
  todo: ListTodo,
  link: Link2,
  idea: Lightbulb,
};

/** Icon + label text for SelectItem contents (Radix mirrors into SelectValue on the trigger). */
export function NoteLabelSelectDisplay({
  label: labelKey,
}: {
  label: NoteLabel;
}) {
  const Icon = NOTE_LABEL_ICONS[labelKey];
  return (
    <>
      <Icon aria-hidden className="size-4 shrink-0 opacity-90" />
      <span className="capitalize">{labelKey}</span>
    </>
  );
}

const SURFACE: Record<NoteLabel, string> = {
  note: "border-border/80 bg-muted/90 text-foreground dark:border-border dark:bg-muted/55 dark:text-foreground",
  todo: "border-emerald-200/55 bg-emerald-50/93 text-emerald-900/88 dark:border-emerald-400/22 dark:bg-emerald-950/30 dark:text-emerald-200",
  link: "border-cyan-200/50 bg-cyan-50/92 text-cyan-800/95 dark:border-cyan-400/22 dark:bg-cyan-950/28 dark:text-cyan-200",
  idea: "border-fuchsia-200/45 bg-fuchsia-50/94 text-fuchsia-900/85 dark:border-fuchsia-400/20 dark:bg-fuchsia-950/26 dark:text-fuchsia-200",
};

const FOCUS_SURFACE: Record<NoteLabel, string> = {
  note: "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 dark:focus-visible:border-ring dark:focus-visible:ring-ring/30",
  todo: "focus-visible:border-emerald-300 focus-visible:ring-emerald-300/18 dark:focus-visible:border-emerald-400 dark:focus-visible:ring-emerald-400/12",
  link: "focus-visible:border-cyan-300 focus-visible:ring-cyan-300/18 dark:focus-visible:border-cyan-400 dark:focus-visible:ring-cyan-400/12",
  idea: "focus-visible:border-fuchsia-300 focus-visible:ring-fuchsia-300/18 dark:focus-visible:border-fuchsia-400 dark:focus-visible:ring-fuchsia-400/12",
};

/** Radix sets `data-highlighted` when an item is focused; `data-state=checked` when it matches the value. */
const SELECT_ITEM_ACCENT: Record<NoteLabel, string> = {
  note: "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[state=checked]:bg-muted data-[state=checked]:text-foreground dark:data-[highlighted]:bg-accent dark:data-[highlighted]:text-accent-foreground dark:focus:bg-accent dark:focus:text-accent-foreground dark:data-[state=checked]:bg-muted dark:data-[state=checked]:text-foreground",
  todo: "data-[highlighted]:bg-emerald-100/55 data-[highlighted]:text-emerald-900 focus:bg-emerald-100/55 focus:text-emerald-900 data-[state=checked]:bg-emerald-100/38 data-[state=checked]:text-emerald-900 dark:data-[highlighted]:bg-emerald-950/42 dark:data-[highlighted]:text-emerald-200 dark:focus:bg-emerald-950/42 dark:focus:text-emerald-200 dark:data-[state=checked]:bg-emerald-950/30 dark:data-[state=checked]:text-emerald-200",
  link: "data-[highlighted]:bg-cyan-100/50 data-[highlighted]:text-cyan-800 focus:bg-cyan-100/50 focus:text-cyan-800 data-[state=checked]:bg-cyan-100/35 data-[state=checked]:text-cyan-800 dark:data-[highlighted]:bg-cyan-950/40 dark:data-[highlighted]:text-cyan-200 dark:focus:bg-cyan-950/40 dark:focus:text-cyan-200 dark:data-[state=checked]:bg-cyan-950/30 dark:data-[state=checked]:text-cyan-200",
  idea: "data-[highlighted]:bg-fuchsia-100/45 data-[highlighted]:text-fuchsia-900 focus:bg-fuchsia-100/45 focus:text-fuchsia-900 data-[state=checked]:bg-fuchsia-100/30 data-[state=checked]:text-fuchsia-900 dark:data-[highlighted]:bg-fuchsia-950/38 dark:data-[highlighted]:text-fuchsia-200 dark:focus:bg-fuchsia-950/38 dark:focus:text-fuchsia-200 dark:data-[state=checked]:bg-fuchsia-950/26 dark:data-[state=checked]:text-fuchsia-200",
};

function isNoteLabel(value: string): value is NoteLabel {
  return (NOTE_LABELS as readonly string[]).includes(value);
}

/** Border + light background + text for triggers, badges, etc. */
export function noteLabelSurfaceClass(
  label: string | null | undefined
): string {
  if (label && isNoteLabel(label)) {
    return SURFACE[label];
  }
  return "border-border/60 bg-muted/40 text-muted-foreground";
}

/** Matches the label ring on focus (for select triggers). */
export function noteLabelSelectFocusClass(
  label: string | null | undefined
): string {
  if (label && isNoteLabel(label)) {
    return FOCUS_SURFACE[label];
  }
  return "";
}

/** Highlight / focus / selected state for capture-type select items. */
export function noteLabelSelectItemAccentClass(label: NoteLabel): string {
  return SELECT_ITEM_ACCENT[label];
}

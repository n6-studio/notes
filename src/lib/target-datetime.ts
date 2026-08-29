export const DEFAULT_TARGET_TIME = "09:00";

export type TargetDatetimePreset = "today" | "tomorrow" | "custom";

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

/** Local datetime string compatible with `<input type="datetime-local" />`. */
export function toDatetimeLocalValue(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function parseDatetimeLocal(value: string): Date | undefined {
  if (!value.trim()) {
    return;
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return;
  }
  return d;
}

export function timePartFromDate(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function localDateAtTime(date: Date, timePart: string): Date {
  const [h, m] = timePart.split(":").map(Number);
  const hh = Number.isFinite(h) ? h : 9;
  const mm = Number.isFinite(m) ? m : 0;
  const merged = new Date(date);
  merged.setHours(hh, mm, 0, 0);
  return merged;
}

export function shiftLocalDay(date: Date, days: number): Date {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + days);
  return shifted;
}

export function presetForLocalValue(
  value: string,
  now: Date = new Date()
): TargetDatetimePreset | null {
  const parsed = parseDatetimeLocal(value);
  if (!parsed) {
    return null;
  }
  if (isSameLocalDay(parsed, now)) {
    return "today";
  }
  if (isSameLocalDay(parsed, shiftLocalDay(now, 1))) {
    return "tomorrow";
  }
  return "custom";
}

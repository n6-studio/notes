import { describe, expect, it } from "vitest";
import {
  isSameLocalDay,
  localDateAtTime,
  parseDatetimeLocal,
  presetForLocalValue,
  shiftLocalDay,
  toDatetimeLocalValue,
} from "~/lib/target-datetime";

const now = new Date(2026, 7, 29, 14, 30);

describe("parseDatetimeLocal", () => {
  it("returns undefined for empty or invalid values", () => {
    expect(parseDatetimeLocal("")).toBeUndefined();
    expect(parseDatetimeLocal("   ")).toBeUndefined();
    expect(parseDatetimeLocal("not-a-date")).toBeUndefined();
  });

  it("parses a local datetime string", () => {
    const parsed = parseDatetimeLocal("2026-08-29T09:00");
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(7);
    expect(parsed?.getDate()).toBe(29);
    expect(parsed?.getHours()).toBe(9);
    expect(parsed?.getMinutes()).toBe(0);
  });
});

describe("isSameLocalDay", () => {
  it("matches calendar day and ignores time", () => {
    expect(
      isSameLocalDay(new Date(2026, 7, 29, 9, 0), new Date(2026, 7, 29, 23, 59))
    ).toBe(true);
    expect(
      isSameLocalDay(new Date(2026, 7, 29, 23, 59), new Date(2026, 7, 30, 0, 0))
    ).toBe(false);
  });
});

describe("localDateAtTime", () => {
  it("applies hours and minutes onto the given day", () => {
    const merged = localDateAtTime(new Date(2026, 7, 29, 3, 4), "15:45");
    expect(toDatetimeLocalValue(merged)).toBe("2026-08-29T15:45");
  });

  it("defaults to 09:00 when the time part is unusable", () => {
    const merged = localDateAtTime(new Date(2026, 7, 29, 3, 4), "nope");
    expect(toDatetimeLocalValue(merged)).toBe("2026-08-29T09:00");
  });
});

describe("presetForLocalValue", () => {
  it("returns null for an empty value", () => {
    expect(presetForLocalValue("", now)).toBeNull();
    expect(presetForLocalValue("   ", now)).toBeNull();
  });

  it("classifies today, tomorrow, and other days", () => {
    expect(
      presetForLocalValue(
        toDatetimeLocalValue(new Date(2026, 7, 29, 9, 0)),
        now
      )
    ).toBe("today");
    expect(
      presetForLocalValue(
        toDatetimeLocalValue(shiftLocalDay(new Date(2026, 7, 29, 9, 0), 1)),
        now
      )
    ).toBe("tomorrow");
    expect(
      presetForLocalValue(toDatetimeLocalValue(new Date(2026, 8, 1, 9, 0)), now)
    ).toBe("custom");
  });
});

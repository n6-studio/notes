import { describe, expect, it } from "vitest";
import {
  companionFirstName,
  dayPartFromHour,
  homeCompanionsFor,
  pickHomeCompanion,
} from "~/lib/home-greeting";

describe("companionFirstName", () => {
  it("uses the first word of a real name", () => {
    expect(companionFirstName("Alessandro Narciso")).toBe("Alessandro");
  });

  it("skips anonymous, guest, and email-like names", () => {
    expect(companionFirstName("Alessandro", true)).toBeUndefined();
    expect(companionFirstName("Guest-ab12cd")).toBeUndefined();
    expect(companionFirstName("ada@example.com")).toBeUndefined();
    expect(companionFirstName("A")).toBeUndefined();
    expect(companionFirstName("   ")).toBeUndefined();
  });
});

describe("dayPartFromHour", () => {
  it("buckets hours into companion day parts", () => {
    expect(dayPartFromHour(7)).toBe("morning");
    expect(dayPartFromHour(14)).toBe("afternoon");
    expect(dayPartFromHour(19)).toBe("evening");
    expect(dayPartFromHour(23)).toBe("night");
    expect(dayPartFromHour(2)).toBe("night");
  });
});

describe("home companions", () => {
  it("pairs a named evening greeting with a matching save label", () => {
    const named = homeCompanionsFor({ firstName: "Ada", hour: 19 });
    const anonymous = homeCompanionsFor({ hour: 19 });

    expect(named).toContainEqual({
      greeting: "Evening, Ada",
      saveLabel: "Drop it",
    });
    expect(anonymous).toContainEqual({
      greeting: "Good evening",
      saveLabel: "Drop it",
    });
    expect(anonymous.map((pair) => pair.greeting).join(" ")).not.toContain(
      "Ada"
    );
  });

  it("picks from the resolved pool and skips the previous greeting", () => {
    const pool = homeCompanionsFor({ firstName: "Ada", hour: 8 });
    const first = pickHomeCompanion(
      { firstName: "Ada", hour: 8 },
      undefined,
      () => 0
    );
    expect(first).toEqual(pool[0]);

    const next = pickHomeCompanion(
      { firstName: "Ada", hour: 8 },
      first,
      () => 0
    );
    expect(next.greeting).not.toBe(first.greeting);
    expect(next).toEqual(pool[1]);
  });

  it("keeps every save label in the it-verb pattern", () => {
    const pool = homeCompanionsFor({ firstName: "Ada", hour: 19 });
    for (const pair of pool) {
      expect(pair.saveLabel.endsWith(" it")).toBe(true);
    }
  });

  it("uses only companion titles for the logged-out placeholder pool", () => {
    const pool = homeCompanionsFor({ hour: 19, titlesOnly: true });
    const greetings = pool.map((pair) => pair.greeting);

    expect(greetings).toContain("What's sitting with you?");
    expect(greetings).not.toContain("Good evening");
    expect(greetings).not.toContain("Hey");
  });
});

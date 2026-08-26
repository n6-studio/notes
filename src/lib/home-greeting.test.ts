import { describe, expect, it } from "vitest";
import {
  companionFirstName,
  cycleHomeSaveLabel,
  dayPartFromHour,
  HOME_SAVE_LABEL_SIZER,
  homeCompanionsFor,
  pickHomeCompanion,
  pickHomeCompanionForPage,
} from "~/lib/home-greeting";

function sourceText(
  descriptor: { id?: string; message?: string } | undefined
): string {
  return descriptor?.message ?? descriptor?.id ?? "";
}

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

    expect(
      named.some(
        (pair) =>
          sourceText(pair.greeting).includes("{firstName}") &&
          pair.greeting.values?.firstName === "Ada" &&
          sourceText(pair.saveLabel) === "Save it"
      )
    ).toBe(true);
    expect(
      anonymous.some(
        (pair) =>
          sourceText(pair.greeting) === "Good evening" &&
          sourceText(pair.saveLabel) === "Save it"
      )
    ).toBe(true);
    expect(
      anonymous
        .map((pair) => sourceText(pair.greeting))
        .join(" ")
        .includes("Ada")
    ).toBe(false);
  });

  it("picks from the resolved pool and skips the previous greeting", () => {
    const pool = homeCompanionsFor({ firstName: "Ada", hour: 8 });
    const first = pickHomeCompanion(
      { firstName: "Ada", hour: 8 },
      undefined,
      () => 0
    );
    expect(sourceText(first.greeting)).toBe(sourceText(pool[0]?.greeting));

    const next = pickHomeCompanion(
      { firstName: "Ada", hour: 8 },
      first,
      () => 0
    );
    expect(sourceText(next.greeting)).not.toBe(sourceText(first.greeting));
    expect(sourceText(next.greeting)).toBe(sourceText(pool[1]?.greeting));
  });

  it("keeps every save label in the it-verb pattern", () => {
    const pool = homeCompanionsFor({ firstName: "Ada", hour: 19 });
    for (const pair of pool) {
      expect(sourceText(pair.saveLabel).endsWith(" it")).toBe(true);
      expect(sourceText(HOME_SAVE_LABEL_SIZER).length).toBeGreaterThanOrEqual(
        sourceText(pair.saveLabel).length
      );
    }
  });

  it("uses only companion titles for the logged-out placeholder pool", () => {
    const pool = homeCompanionsFor({ hour: 19, titlesOnly: true });
    const greetings = pool.map((pair) => sourceText(pair.greeting));

    expect(greetings).toContain("What's on your mind?");
    expect(greetings).not.toContain("Good evening");
    expect(greetings).not.toContain("Hey");
    expect(greetings.join(" ")).not.toContain("{firstName}");
  });

  it("picks a landing companion without time-of-day greetings", () => {
    const pair = pickHomeCompanionForPage(
      "landing",
      { isAnonymous: false, name: "Ada" },
      () => 0
    );
    expect(sourceText(pair.greeting)).toBe("What's on your mind?");
    expect(sourceText(pair.saveLabel)).toBe("Save it");
  });

  it("mixes named companion titles into the home pool only", () => {
    const named = homeCompanionsFor({ firstName: "Ada", hour: 19 });
    const namedGreetings = named.map((pair) => sourceText(pair.greeting));
    const anonymous = homeCompanionsFor({ hour: 19 });
    const landing = homeCompanionsFor({
      firstName: "Ada",
      hour: 19,
      titlesOnly: true,
    });

    expect(namedGreetings).toContain("What's on your mind, {firstName}?");
    expect(namedGreetings).toContain("I'm listening, {firstName}");
    expect(namedGreetings).toContain("What's on your mind?");
    expect(
      named.some(
        (pair) =>
          sourceText(pair.greeting) === "What's on your mind, {firstName}?" &&
          pair.greeting.values?.firstName === "Ada"
      )
    ).toBe(true);

    expect(
      anonymous.map((pair) => sourceText(pair.greeting)).join(" ")
    ).not.toContain("{firstName}");
    expect(
      landing.map((pair) => sourceText(pair.greeting)).join(" ")
    ).not.toContain("{firstName}");
  });

  it("cycles only the save label so the SSR greeting stays put", () => {
    const first = pickHomeCompanionForPage("home", undefined, () => 0);
    const next = cycleHomeSaveLabel(first, () => 0);

    expect(sourceText(next.greeting)).toBe(sourceText(first.greeting));
    expect(sourceText(next.saveLabel)).not.toBe(sourceText(first.saveLabel));
  });
});

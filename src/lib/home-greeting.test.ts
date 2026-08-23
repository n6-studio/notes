import { describe, expect, it } from "vitest";
import {
  companionFirstName,
  dayPartFromHour,
  homeGreetingsFor,
  pickHomeGreeting,
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

describe("home greetings", () => {
  it("includes a named evening greeting without leaking names when anonymous", () => {
    const named = homeGreetingsFor({ firstName: "Ada", hour: 19 });
    const anonymous = homeGreetingsFor({ hour: 19 });

    expect(named).toContain("Evening, Ada");
    expect(anonymous).toContain("Good evening");
    expect(anonymous.join(" ")).not.toContain("Ada");
  });

  it("picks from the resolved pool", () => {
    const pool = homeGreetingsFor({ firstName: "Ada", hour: 8 });
    expect(pickHomeGreeting({ firstName: "Ada", hour: 8 }, () => 0)).toBe(
      pool[0]
    );
    expect(pickHomeGreeting({ firstName: "Ada", hour: 8 }, () => 0.99)).toBe(
      pool.at(-1)
    );
  });
});

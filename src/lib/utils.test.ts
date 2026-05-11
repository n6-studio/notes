import { describe, expect, it } from "vitest";
import { cn } from "~/lib/utils";

describe("cn", () => {
  it("merges classes", () => {
    expect(cn("a", false, "c")).toBe("a c");
  });
});

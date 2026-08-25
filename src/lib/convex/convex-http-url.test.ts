import { describe, expect, it } from "vitest";
import { convexHttpUrl } from "~/lib/convex/convex-http-url";

describe("convexHttpUrl", () => {
  it("prefers an explicit site URL", () => {
    expect(
      convexHttpUrl(
        "https://example.convex.cloud",
        "https://example.convex.site"
      )
    ).toBe("https://example.convex.site");
  });

  it("derives .site from the Convex cloud URL", () => {
    expect(
      convexHttpUrl("https://example.eu-west-1.convex.cloud", undefined)
    ).toBe("https://example.eu-west-1.convex.site");
  });
});

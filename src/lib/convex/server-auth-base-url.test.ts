import { describe, expect, it } from "vitest";
import { serverAuthBaseUrl } from "~/lib/convex/server-auth-base-url";

describe("serverAuthBaseUrl", () => {
  it("prefers Convex site over the app origin", () => {
    expect(
      serverAuthBaseUrl(
        "https://notes.n6.studio",
        "https://warmhearted-toad-291.eu-west-1.convex.site"
      )
    ).toBe("https://warmhearted-toad-291.eu-west-1.convex.site");
  });

  it("falls back to the app origin when Convex site is missing", () => {
    expect(serverAuthBaseUrl("https://notes.n6.studio", undefined)).toBe(
      "https://notes.n6.studio"
    );
  });
});

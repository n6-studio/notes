import { describe, expect, it } from "vitest";
import { authProxyWouldLoop } from "~/lib/convex/auth-proxy-url";

describe("authProxyWouldLoop", () => {
  it("detects a site URL that points at the app itself", () => {
    expect(
      authProxyWouldLoop(
        "https://notes.n6.studio",
        "https://notes.n6.studio/api/auth/convex/token"
      )
    ).toBe(true);
  });

  it("allows proxying to Convex .site", () => {
    expect(
      authProxyWouldLoop(
        "https://warmhearted-toad-291.eu-west-1.convex.site",
        "https://notes.n6.studio/api/auth/convex/token"
      )
    ).toBe(false);
  });

  it("treats a missing site URL as a loop", () => {
    expect(
      authProxyWouldLoop("", "https://notes.n6.studio/api/auth/get-session")
    ).toBe(true);
  });
});

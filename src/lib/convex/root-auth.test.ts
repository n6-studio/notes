import { describe, expect, it } from "vitest";
import {
  rootAuthFromGetToken,
  shouldSendAnonymousUserToLanding,
  shouldSendAuthenticatedUserHome,
} from "~/lib/convex/root-auth";

describe("rootAuthFromGetToken", () => {
  it("treats a missing token as logged out", () => {
    expect(rootAuthFromGetToken(undefined, false)).toEqual({
      isAuthenticated: false,
      lookupFailed: false,
      token: null,
    });
  });

  it("keeps a successful token", () => {
    expect(rootAuthFromGetToken("jwt", false)).toEqual({
      isAuthenticated: true,
      lookupFailed: false,
      token: "jwt",
    });
  });
});

describe("auth redirect cycle", () => {
  it("does not send a failed lookup to /home", () => {
    const failed = rootAuthFromGetToken(null, true);
    expect(shouldSendAuthenticatedUserHome(failed)).toBe(false);
    expect(shouldSendAnonymousUserToLanding(failed)).toBe(true);
  });

  it("sends a confirmed session home and not back to landing", () => {
    const authed = rootAuthFromGetToken("jwt", false);
    expect(shouldSendAuthenticatedUserHome(authed)).toBe(true);
    expect(shouldSendAnonymousUserToLanding(authed)).toBe(false);
  });

  it("keeps a confirmed anonymous visit on landing", () => {
    const anon = rootAuthFromGetToken(null, false);
    expect(shouldSendAuthenticatedUserHome(anon)).toBe(false);
    expect(shouldSendAnonymousUserToLanding(anon)).toBe(true);
  });
});

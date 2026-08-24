export interface RootAuthContext {
  isAuthenticated: boolean;
  lookupFailed: boolean;
  token: string | null;
}

export function rootAuthFromGetToken(
  token: string | null | undefined,
  lookupFailed: boolean
): RootAuthContext {
  const resolved = token ?? null;
  return {
    isAuthenticated: Boolean(resolved),
    lookupFailed,
    token: resolved,
  };
}

/**
 * `/` redirects authenticated users to `/home`. Skip that bounce when the
 * token lookup itself failed — otherwise a flaky GET can ping-pong with
 * `/_authed` forever.
 */
export function shouldSendAuthenticatedUserHome(auth: {
  isAuthenticated: boolean;
  lookupFailed?: boolean;
}): boolean {
  return auth.isAuthenticated && !auth.lookupFailed;
}

export function shouldSendAnonymousUserToLanding(auth: {
  isAuthenticated: boolean;
}): boolean {
  return !auth.isAuthenticated;
}

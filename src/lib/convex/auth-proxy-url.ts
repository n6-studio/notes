function originOf(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/** True when proxying `/api/auth` would fetch this same Vercel deployment. */
export function authProxyWouldLoop(
  convexSiteUrl: string,
  requestUrl: string
): boolean {
  if (!convexSiteUrl) {
    return true;
  }
  const siteOrigin = originOf(convexSiteUrl);
  const requestOrigin = originOf(requestUrl);
  if (!(siteOrigin && requestOrigin)) {
    return true;
  }
  return siteOrigin === requestOrigin;
}

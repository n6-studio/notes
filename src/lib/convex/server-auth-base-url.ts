/**
 * Browser auth calls same-origin `/api/auth` (the Vercel proxy).
 * SSR must talk to Convex HTTP directly — `VITE_SITE_URL` is this app,
 * and fetching it from the serverless function is a Vercel 508 loop.
 */
export function serverAuthBaseUrl(
  siteUrl: string | undefined,
  convexSiteUrl: string | undefined
): string | undefined {
  return convexSiteUrl || siteUrl;
}

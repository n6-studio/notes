/** Loopback origins Vite may bind to when the configured SITE_URL port is taken. */
const DEV_LOOPBACK_ORIGIN_PATTERNS = [
  "http://localhost:*",
  "http://127.0.0.1:*",
  "http://[::1]:*",
] as const;

/**
 * Better Auth `trustedOrigins` for this deployment.
 * In development, also trust local loopback on any port so `vite dev` can
 * fall back (e.g. 3000 → 3001) without CSRF origin checks returning 403.
 */
export function betterAuthTrustedOrigins(
  siteUrl: string,
  deployEnv: string | undefined
): string[] {
  if (deployEnv === "development") {
    return [siteUrl, ...DEV_LOOPBACK_ORIGIN_PATTERNS];
  }
  return [siteUrl];
}

const CONVEX_CLOUD_HOST_RE = /\.convex\.cloud$/;

/** Convex HTTP Actions live on `.site`; the sync client uses `.cloud`. */
export function convexHttpUrl(
  convexUrl: string | undefined,
  convexSiteUrl: string | undefined
): string {
  if (convexSiteUrl) {
    return convexSiteUrl;
  }
  if (convexUrl?.endsWith(".convex.cloud")) {
    return convexUrl.replace(CONVEX_CLOUD_HOST_RE, ".convex.site");
  }
  return convexUrl ?? "";
}

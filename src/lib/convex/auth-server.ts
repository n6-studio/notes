import { convexBetterAuthReactStart } from "kitcn/auth/start";
import { authProxyWouldLoop } from "~/lib/convex/auth-proxy-url";

const start = convexBetterAuthReactStart({
  convexUrl: import.meta.env.VITE_CONVEX_URL ?? "",
  convexSiteUrl: import.meta.env.VITE_CONVEX_SITE_URL ?? "",
});

export const getToken = start.getToken;
export const fetchAuthQuery = start.fetchAuthQuery;
export const fetchAuthMutation = start.fetchAuthMutation;
export const fetchAuthAction = start.fetchAuthAction;

export async function handler(request: Request): Promise<Response> {
  const convexSiteUrl = import.meta.env.VITE_CONVEX_SITE_URL ?? "";
  if (authProxyWouldLoop(convexSiteUrl, request.url)) {
    console.error("[auth] refusing to proxy /api/auth to the app origin");
    return new Response("Auth proxy misconfigured", { status: 500 });
  }
  return await start.handler(request);
}

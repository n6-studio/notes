import { convexBetterAuthReactStart } from "kitcn/auth/start";
import { convexHttpUrl } from "~/lib/convex/convex-http-url";

export const {
  handler,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthReactStart({
  convexUrl: import.meta.env.VITE_CONVEX_URL ?? "",
  convexSiteUrl: convexHttpUrl(
    import.meta.env.VITE_CONVEX_URL,
    import.meta.env.VITE_CONVEX_SITE_URL
  ),
});

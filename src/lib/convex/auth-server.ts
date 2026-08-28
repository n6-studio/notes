import { convexBetterAuthReactStart } from "kitcn/auth/start/server";
import { convexHttpUrl } from "~/lib/convex/convex-http-url";
import { api } from "../../../convex/_generated/api.js";

export const {
  handler,
  getToken,
  createCaller,
  createContext,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthReactStart({
  api,
  convexSiteUrl: convexHttpUrl(
    import.meta.env.VITE_CONVEX_URL,
    import.meta.env.VITE_CONVEX_SITE_URL
  ),
  convexUrl: import.meta.env.VITE_CONVEX_URL ?? "",
});

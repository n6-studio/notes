import { createCRPCContext } from "kitcn/react";

import { authCrpcApi } from "./auth-crpc-api";
import { convexHttpUrl } from "./convex-http-url";
import { notesCrpcApi } from "./notes-crpc-api";

const convexSiteUrl = convexHttpUrl(
  import.meta.env.VITE_CONVEX_URL,
  import.meta.env.VITE_CONVEX_SITE_URL
);

if (!convexSiteUrl) {
  throw new Error("VITE_CONVEX_URL or VITE_CONVEX_SITE_URL is not set");
}

export const { CRPCProvider, useCRPC, useCRPCClient } = createCRPCContext({
  api: { ...notesCrpcApi, ...authCrpcApi },
  convexSiteUrl,
});

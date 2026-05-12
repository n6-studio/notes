import { createCRPCContext } from "kitcn/react";

import { authCrpcApi } from "./auth-crpc-api";
import { notesCrpcApi } from "./notes-crpc-api";

const convexSiteUrl = import.meta.env.VITE_CONVEX_SITE_URL as
  | string
  | undefined;

if (!convexSiteUrl) {
  throw new Error("VITE_CONVEX_SITE_URL is not set");
}

export const { CRPCProvider, useCRPC, useCRPCClient } = createCRPCContext({
  api: { ...notesCrpcApi, ...authCrpcApi },
  convexSiteUrl,
});

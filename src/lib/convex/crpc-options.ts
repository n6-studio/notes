import { createCRPCOptionsProxy } from "kitcn/react";

import { authCrpcApi } from "./auth-crpc-api";
import { notesCrpcApi } from "./notes-crpc-api";

const crpcApi = { ...notesCrpcApi, ...authCrpcApi };

/**
 * Same CRPC paths as `useCRPC()`, without React — safe for loaders / server `beforeLoad`.
 * Pass the merged API object as `meta` so kitcn can resolve `auth` / `type` on each leaf.
 */
export const crpcOptions = createCRPCOptionsProxy(crpcApi, crpcApi);

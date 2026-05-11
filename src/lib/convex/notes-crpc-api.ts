import { makeFunctionReference } from "convex/server";

/**
 * Convex `_generated/api.js` currently emits `anyApi`.
 * kitcn CRPC resolves `leaf.functionRef`; `anyApi` paths are Proxies, so reading
 * `.functionRef` appends that segment and produces invalid refs like `notes/create:functionRef`.
 */
function crpcLeaf(
  kind: "query" | "mutation",
  convexName:
    | "notes:list"
    | "notes:get"
    | "notes:getAttachmentUrl"
    | "notes:create"
    | "notes:generateUploadUrl",
  leaf: Record<string, unknown>
) {
  const functionRef = makeFunctionReference(convexName);

  return {
    ...leaf,
    type: kind,
    functionRef,
  };
}

type ConvexCodegenApiType =
  typeof import("../../../convex/_generated/api.js").api;

/**
 * Narrow API surface wired through `crpc.tsx` — keep in sync with `convex/notes.ts`.
 * Cast restores kitcn/CRPC types; runtime values are Convex `makeFunctionReference` refs
 * compatible with `_generated/api` leaf layout.
 */
export const notesCrpcApi = {
  notes: {
    list: crpcLeaf("query", "notes:list", { auth: "required" }),
    get: crpcLeaf("query", "notes:get", { auth: "required" }),
    getAttachmentUrl: crpcLeaf("query", "notes:getAttachmentUrl", {
      auth: "required",
    }),
    create: crpcLeaf("mutation", "notes:create", { auth: "required" }),
    generateUploadUrl: crpcLeaf("mutation", "notes:generateUploadUrl", {
      auth: "required",
    }),
  },
} as unknown as ConvexCodegenApiType;

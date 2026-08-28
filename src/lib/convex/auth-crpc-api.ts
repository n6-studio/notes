import { makeFunctionReference } from "convex/server";

function crpcLeaf(
  kind: "query" | "mutation",
  convexName: "auth:me",
  leaf: Record<string, unknown>
) {
  const functionRef = makeFunctionReference(convexName);

  return {
    ...leaf,
    functionRef,
    type: kind,
  };
}

type ConvexCodegenApiType =
  typeof import("../../../convex/_generated/api.js").api;

export const authCrpcApi = {
  auth: {
    me: crpcLeaf("query", "auth:me", { auth: "optional" }),
  },
} as unknown as ConvexCodegenApiType;

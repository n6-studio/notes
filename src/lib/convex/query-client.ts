import {
  type DefaultOptions,
  defaultShouldDehydrateQuery,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import { isCRPCClientError, isCRPCError } from "kitcn/crpc";
import type { ConvexQueryClient } from "kitcn/react";

export const hydrationConfig: Pick<DefaultOptions, "dehydrate" | "hydrate"> = {
  dehydrate: {
    shouldDehydrateQuery: (query) =>
      defaultShouldDehydrateQuery(query) || query.state.status === "pending",
    shouldRedactErrors: () => false,
  },
};

/**
 * Subscribes Convex live queries to the cache and installs TanStack defaults
 * expected by kitcn CRPC (`convexQuery` options omit `queryFn`; see kitcn
 * `ConvexQueryClient.queryFn()` docs).
 */
export function attachConvexQueryClient(
  queryClient: QueryClient,
  convexQueryClient: ConvexQueryClient
): void {
  convexQueryClient.connect(queryClient);
  const current = queryClient.getDefaultOptions();
  queryClient.setDefaultOptions({
    ...current,
    queries: {
      ...current.queries,
      queryFn: convexQueryClient.queryFn(),
      queryKeyHashFn: convexQueryClient.hashFn(),
    },
  });
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      ...hydrationConfig,
      queries: {
        retry: (failureCount, error) => {
          if (isCRPCError(error)) {
            return false;
          }
          return failureCount < 3;
        },
      },
    },
    queryCache: new QueryCache({
      onError: (error) => {
        if (isCRPCClientError(error)) {
          console.warn("[CRPC]", error.code, error.functionName);
        }
      },
    }),
  });
}

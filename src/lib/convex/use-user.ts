import { useQuery } from "@tanstack/react-query";

import { useCRPC } from "./crpc";

/**
 * Current Convex-backed user from `auth.me` (optional auth — unauthenticated callers get `null`).
 * Uses `useQuery` (not suspense) so it is safe inside `TopNav` without a `Suspense` boundary.
 */
export function useUser() {
  const crpc = useCRPC();

  const { data } = useQuery({
    ...crpc.auth.me.queryOptions({}, { skipUnauth: true }),
  });
  const user = data ?? null;

  return {
    user,
    isAuthenticated: user != null,
  };
}

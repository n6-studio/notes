import { type ConvexQueryClient, useAuthStore } from "kitcn/react";
import { type ReactNode, useEffect } from "react";

/**
 * Wires kitcn auth store into ConvexQueryClient so subscription / error
 * handling respects session state (see kitcn TanStack Start docs).
 */
export function ConvexQueryAuthBind({
  convexQueryClient,
  children,
}: {
  convexQueryClient: ConvexQueryClient;
  children: ReactNode;
}) {
  const authStore = useAuthStore();
  useEffect(() => {
    convexQueryClient.updateAuthStore(authStore);
  }, [authStore, convexQueryClient]);
  return children;
}

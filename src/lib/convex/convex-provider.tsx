import { QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query";
import { ConvexAuthProvider } from "kitcn/auth/client";
import type { ConvexQueryClient } from "kitcn/react";
import type { QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { ConvexQueryAuthBind } from "~/components/convex-query-auth-bind";
import { authClient } from "~/lib/convex/auth-client";
import { CRPCProvider } from "~/lib/convex/crpc";

export function ConvexAppProvider({
  children,
  queryClient,
  convexQueryClient,
  initialToken,
}: {
  children: ReactNode;
  queryClient: QueryClient;
  convexQueryClient: ConvexQueryClient;
  initialToken?: string | null;
}) {
  return (
    <ConvexAuthProvider
      authClient={authClient}
      client={convexQueryClient.convexClient}
      initialToken={initialToken ?? undefined}
    >
      <TanstackQueryClientProvider client={queryClient}>
        <ConvexQueryAuthBind convexQueryClient={convexQueryClient}>
          <CRPCProvider
            convexClient={convexQueryClient.convexClient}
            convexQueryClient={convexQueryClient}
          >
            {children}
          </CRPCProvider>
        </ConvexQueryAuthBind>
      </TanstackQueryClientProvider>
    </ConvexAuthProvider>
  );
}

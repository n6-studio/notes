import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { crpcOptions } from "~/lib/convex/crpc-options";
import { shouldSendAnonymousUserToLanding } from "~/lib/convex/root-auth";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ context }) => {
    if (shouldSendAnonymousUserToLanding(context)) {
      throw redirect({ replace: true, to: "/" });
    }

    await context.queryClient.ensureQueryData({
      ...crpcOptions.auth.me.staticQueryOptions({}, { skipUnauth: true }),
    });
  },
  component: () => <Outlet />,
});

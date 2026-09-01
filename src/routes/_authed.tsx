import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { SkySwitch } from "~/components/sky-switch";
import { crpcOptions } from "~/lib/convex/crpc-options";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ replace: true, to: "/" });
    }

    await context.queryClient.ensureQueryData({
      ...crpcOptions.auth.me.staticQueryOptions({}, { skipUnauth: true }),
    });
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  return (
    <>
      <SkySwitch />
      <div className="app-view">
        <Outlet />
      </div>
    </>
  );
}

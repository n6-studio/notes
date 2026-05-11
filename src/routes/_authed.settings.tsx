import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { TopNav } from "~/components/top-nav";

export const Route = createFileRoute("/_authed/settings")({
  component: Settings,
});

function Settings() {
  const { isAuthenticated } = useRouteContext({ from: "__root__" });

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav isAuthenticated={isAuthenticated} />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-8 pb-16 md:pt-12">
        <h1 className="font-medium text-foreground/90 text-xl tracking-tight">
          Settings
        </h1>
      </main>
    </div>
  );
}

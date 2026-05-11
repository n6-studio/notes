import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { ChatComposer } from "~/components/chat-composer";
import { TopNav } from "~/components/top-nav";

export const Route = createFileRoute("/_authed/home")({
  component: Home,
});

function Home() {
  const { isAuthenticated } = useRouteContext({ from: "__root__" });

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav isAuthenticated={isAuthenticated} />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-8 pb-16 md:pt-12">
        <ChatComposer variant="home" />
      </main>
    </div>
  );
}

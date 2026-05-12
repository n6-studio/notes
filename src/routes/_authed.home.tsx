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
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 py-8 md:py-12">
        <ChatComposer className="w-full" variant="home" />
      </main>
    </div>
  );
}

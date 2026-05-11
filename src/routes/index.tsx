import {
  createFileRoute,
  useNavigate,
  useRouteContext,
} from "@tanstack/react-router";
import { ChatComposer } from "~/components/chat-composer";
import { TopNav } from "~/components/top-nav";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { isAuthenticated } = useRouteContext({ from: "__root__" });
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav isAuthenticated={isAuthenticated} />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-10 pb-16 md:pt-16">
        <div className="mb-8 text-center md:mb-12">
          <h1 className="text-balance font-semibold text-3xl tracking-tight md:text-4xl">
            Capture now.
          </h1>
          <p className="mt-3 text-pretty text-muted-foreground text-sm md:text-base">
            Text, reminders, links, and images—kept minimal. Hit send and start
            dumping.
          </p>
        </div>
        <ChatComposer
          onCreated={() => navigate({ to: "/home" })}
          variant="landing"
        />
      </main>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ChatComposer } from "~/components/chat-composer";
import { TopNav } from "~/components/top-nav";
import { authClient } from "~/lib/convex/auth-client";
import { useCRPC } from "~/lib/convex/crpc";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated) {
      throw redirect({ to: "/home" });
    }
  },
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const crpc = useCRPC();
  const { data: me } = useQuery({
    ...crpc.auth.me.queryOptions({}, { skipUnauth: true }),
  });

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-[oklch(0.14_0_0)] to-[oklch(0.07_0_0)]">
      <TopNav isAuthenticated={Boolean(me)} />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 pt-10 pb-16 md:pt-16">
        <div className="flex h-[24dvh] flex-col justify-center gap-4 text-center md:h-[30dvh]">
          <h1 className="text-balance font-semibold text-4xl tracking-tight md:text-5xl">
            Capture now
          </h1>
          <p className="text-pretty text-base text-muted-foreground md:text-lg">
            Text, links, target dates, and images—kept minimal. Hit send and
            start dumping.
          </p>
        </div>

        <div className="flex h-[40dvh] flex-col justify-start">
          <ChatComposer
            onCreated={() => navigate({ to: "/home" })}
            onPreSubmit={async () => {
              await authClient.signIn.anonymous({
                fetchOptions: { throw: true },
              });
            }}
            variant="landing"
          />
        </div>
      </main>
    </div>
  );
}

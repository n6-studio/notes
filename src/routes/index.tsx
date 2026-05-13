import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ChatComposer } from "~/components/chat-composer";
import { TopNav } from "~/components/top-nav";
import { authClient } from "~/lib/convex/auth-client";

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

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-[oklch(0.16_0_0)] to-[oklch(0.08_0_0)]">
      <TopNav />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 pt-10 pb-16 md:pt-16">
        <div className="flex h-[24dvh] flex-col justify-center gap-4 text-center md:h-[30dvh]">
          <h1 className="text-balance font-semibold text-4xl tracking-tight md:text-5xl">
            Save what matters in one line
          </h1>
          <p className="text-pretty text-base text-muted-foreground md:text-lg">
            Jot a thought, paste a URL, pick a time, or attach a photo—then send
            once. Everything lands in your inbox and stays in sync for when you
            actually need it.
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

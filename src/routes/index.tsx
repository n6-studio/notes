import { Trans, useLingui } from "@lingui/react/macro";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ChatComposer } from "~/components/chat-composer";
import {
  HomeCompanionProvider,
  useHomeCompanion,
} from "~/components/home-greeting";
import { NightSkyBackground } from "~/components/night-sky-background";
import { TopNav } from "~/components/top-nav";
import { authClient } from "~/lib/convex/auth-client";
import { pickHomeCompanionForPage } from "~/lib/home-greeting";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated) {
      throw redirect({ replace: true, to: "/home" });
    }
  },
  loader: () => ({ companion: pickHomeCompanionForPage("landing") }),
  component: Landing,
});

function Landing() {
  const { companion } = Route.useLoaderData();

  return (
    <div className="relative flex min-h-screen flex-col">
      <NightSkyBackground />
      <TopNav />
      <HomeCompanionProvider initialPair={companion}>
        <main className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 pt-10 pb-16 md:pt-16">
          <div className="flex h-[24dvh] flex-col justify-center gap-4 text-center md:h-[30dvh]">
            <h1 className="hero-title text-balance font-semibold text-4xl tracking-tight md:text-6xl">
              <Trans>Give space to your mind</Trans>
            </h1>
            <p className="text-pretty text-base text-muted-foreground md:text-lg">
              <Trans>
                Jot a thought, paste a URL, pick a time, or attach a photo—then
                send once. Everything lands in your inbox and stays in sync for
                when you actually need it.
              </Trans>
            </p>
          </div>

          <div className="flex h-[40dvh] flex-col justify-start">
            <LandingComposer />
          </div>
        </main>
      </HomeCompanionProvider>
    </div>
  );
}

function LandingComposer() {
  const navigate = useNavigate();
  const { i18n } = useLingui();
  const { cycle, pair } = useHomeCompanion();

  return (
    <ChatComposer
      onCreated={() => navigate({ to: "/home" })}
      onCycleSaveLabel={cycle}
      onPreSubmit={async () => {
        await authClient.signIn.anonymous({
          fetchOptions: { throw: true },
        });
      }}
      placeholder={i18n._(pair.greeting)}
      saveLabel={i18n._(pair.saveLabel)}
      variant="landing"
    />
  );
}

import { useLingui } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";
import { ChatComposer } from "~/components/chat-composer";
import {
  HomeCompanionProvider,
  HomeGreeting,
  useHomeCompanion,
} from "~/components/home-greeting";
import { NightSkyBackground } from "~/components/night-sky-background";
import { TopNav } from "~/components/top-nav";
import { crpcOptions } from "~/lib/convex/crpc-options";
import {
  type CompanionUser,
  pickHomeCompanionForPage,
} from "~/lib/home-greeting";

export const Route = createFileRoute("/_authed/home")({
  loader: ({ context }) => {
    const user = context.queryClient.getQueryData<CompanionUser | null>(
      crpcOptions.auth.me.staticQueryOptions({}, { skipUnauth: true }).queryKey
    );
    return { companion: pickHomeCompanionForPage("home", user) };
  },
  component: Home,
});

function Home() {
  const { companion } = Route.useLoaderData();

  return (
    <div className="relative flex min-h-screen flex-col">
      <NightSkyBackground />
      <TopNav />
      <HomeCompanionProvider initialPair={companion}>
        <main className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 py-8 md:py-12">
          <HomeGreeting />
          <HomeComposer />
        </main>
      </HomeCompanionProvider>
    </div>
  );
}

function HomeComposer() {
  const { i18n, t } = useLingui();
  const { cycle, pair } = useHomeCompanion();

  return (
    <ChatComposer
      className="w-full"
      onCycleSaveLabel={cycle}
      placeholder={t`Note, URL or image`}
      saveLabel={i18n._(pair.saveLabel)}
      variant="home"
    />
  );
}

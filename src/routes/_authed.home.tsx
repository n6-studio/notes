import { useLingui } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";
import { ChatComposer } from "~/components/chat-composer";
import {
  HomeCompanionProvider,
  HomeGreeting,
  useHomeCompanion,
} from "~/components/home-greeting";
import { TopNav } from "~/components/top-nav";
import { crpcOptions } from "~/lib/convex/crpc-options";
import {
  type CompanionUser,
  pickHomeCompanionForPage,
} from "~/lib/home-greeting";

export const Route = createFileRoute("/_authed/home")({
  component: Home,
  loader: ({ context }) => {
    const user = context.queryClient.getQueryData<CompanionUser | null>(
      crpcOptions.auth.me.staticQueryOptions({}, { skipUnauth: true }).queryKey
    );
    return { companion: pickHomeCompanionForPage("home", user) };
  },
});

function Home() {
  const { companion } = Route.useLoaderData();

  return (
    <div className="relative z-10 flex h-dvh flex-col overflow-hidden overscroll-none">
      <TopNav />
      <HomeCompanionProvider initialPair={companion}>
        <main className="relative mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col justify-center px-4 pt-5 pb-4 md:pt-8 md:pb-6">
          <HomeGreeting />
          <HomeComposer />
        </main>
      </HomeCompanionProvider>
    </div>
  );
}

function HomeComposer() {
  const { i18n, t } = useLingui();
  const { pair } = useHomeCompanion();

  return (
    <ChatComposer
      className="w-full"
      placeholder={t`Note, URL or image`}
      saveLabel={i18n._(pair.saveLabel)}
      variant="home"
    />
  );
}

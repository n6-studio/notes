import { createFileRoute } from "@tanstack/react-router";
import { ChatComposer } from "~/components/chat-composer";
import {
  HomeCompanionProvider,
  HomeGreeting,
  useHomeCompanion,
} from "~/components/home-greeting";
import { NightSkyBackground } from "~/components/night-sky-background";
import { TopNav } from "~/components/top-nav";

export const Route = createFileRoute("/_authed/home")({
  component: Home,
});

function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <NightSkyBackground />
      <TopNav />
      <HomeCompanionProvider>
        <main className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 py-8 md:py-12">
          <HomeGreeting />
          <HomeComposer />
        </main>
      </HomeCompanionProvider>
    </div>
  );
}

function HomeComposer() {
  const { cycle, pair } = useHomeCompanion();

  return (
    <ChatComposer
      className="w-full"
      onCycleSaveLabel={cycle}
      placeholder="Note, URL or image"
      saveLabel={pair?.saveLabel ?? ""}
      variant="home"
    />
  );
}

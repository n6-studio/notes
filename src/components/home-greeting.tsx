import { useLingui } from "@lingui/react/macro";
import { createContext, type ReactNode, use, useEffect, useRef } from "react";
import type { HomeCompanionPair } from "~/lib/home-greeting";
import { cn } from "~/lib/utils";

interface HomeCompanionValue {
  pair: HomeCompanionPair;
}

const HomeCompanionContext = createContext<HomeCompanionValue | null>(null);

export function HomeCompanionProvider({
  children,
  initialPair,
}: {
  children: ReactNode;
  initialPair: HomeCompanionPair;
}) {
  return (
    <HomeCompanionContext value={{ pair: initialPair }}>
      {children}
    </HomeCompanionContext>
  );
}

export function useHomeCompanion() {
  const value = use(HomeCompanionContext);
  if (!value) {
    throw new Error(
      "useHomeCompanion must be used within HomeCompanionProvider"
    );
  }
  return value;
}

export function HomeGreeting() {
  const { i18n } = useLingui();
  const { pair } = useHomeCompanion();
  const greeting = i18n._(pair.greeting);
  const previousPhrase = useRef(greeting);
  const isSwap = previousPhrase.current !== greeting;

  useEffect(() => {
    previousPhrase.current = greeting;
  }, [greeting]);

  return (
    <h1
      aria-live="polite"
      className={cn(
        "hero-title mb-4 min-h-[1.15em] shrink-0 text-balance text-center font-semibold text-3xl tracking-tight md:mb-6 md:text-5xl",
        isSwap && "home-greeting-swap"
      )}
      key={greeting}
    >
      {greeting}
    </h1>
  );
}

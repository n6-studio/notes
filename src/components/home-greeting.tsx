import { useLingui } from "@lingui/react/macro";
import {
  createContext,
  type ReactNode,
  use,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  cycleHomeSaveLabel,
  type HomeCompanionPair,
} from "~/lib/home-greeting";
import { cn } from "~/lib/utils";

interface HomeCompanionValue {
  cycle: () => void;
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
  const [pair, setPair] = useState(initialPair);

  const cycle = () => {
    setPair((current) => cycleHomeSaveLabel(current));
  };

  return (
    <HomeCompanionContext value={{ cycle, pair }}>
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
  const previousPhrase = useRef<string | null>(null);
  const isSwap =
    previousPhrase.current != null && previousPhrase.current !== greeting;

  useEffect(() => {
    previousPhrase.current = greeting;
  }, [greeting]);

  return (
    <h1
      aria-live="polite"
      className={cn(
        "hero-title mb-10 min-h-[1.15em] text-balance text-center font-semibold text-4xl tracking-tight md:mb-16 md:text-6xl",
        isSwap && "home-greeting-swap"
      )}
      key={greeting}
    >
      {greeting}
    </h1>
  );
}

import { useLingui } from "@lingui/react/macro";
import {
  createContext,
  type ReactNode,
  use,
  useEffect,
  useRef,
  useState,
} from "react";
import { useUser } from "~/lib/convex/use-user";
import {
  companionFirstName,
  type HomeCompanionPair,
  pickHomeCompanion,
} from "~/lib/home-greeting";
import { cn } from "~/lib/utils";

interface HomeCompanionValue {
  cycle: () => void;
  pair: HomeCompanionPair;
}

type CompanionScope = "home" | "landing";

const HomeCompanionContext = createContext<HomeCompanionValue | null>(null);

export function HomeCompanionProvider({
  children,
  initialPair,
  scope = "home",
}: {
  children: ReactNode;
  initialPair: HomeCompanionPair;
  scope?: CompanionScope;
}) {
  const { user } = useUser();
  const titlesOnly = scope === "landing";
  const [pair, setPair] = useState(initialPair);

  const cycle = () => {
    setPair((current) =>
      pickHomeCompanion(
        {
          firstName: companionFirstName(user?.name, user?.isAnonymous),
          hour: new Date().getHours(),
          titlesOnly,
        },
        current
      )
    );
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

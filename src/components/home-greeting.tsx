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
  pair: HomeCompanionPair | null;
}

type CompanionScope = "home" | "landing";

const HomeCompanionContext = createContext<HomeCompanionValue | null>(null);

const sessionPairs: Partial<Record<CompanionScope, HomeCompanionPair>> = {};

export function HomeCompanionProvider({
  children,
  scope = "home",
}: {
  children: ReactNode;
  scope?: CompanionScope;
}) {
  const { user } = useUser();
  const [pair, setPair] = useState<HomeCompanionPair | null>(null);
  const titlesOnly = scope === "landing";

  useEffect(() => {
    const ctx = {
      firstName: companionFirstName(user?.name, user?.isAnonymous),
      hour: new Date().getHours(),
      titlesOnly,
    };
    sessionPairs[scope] ??= pickHomeCompanion(ctx);
    setPair(sessionPairs[scope]);
  }, [scope, titlesOnly, user?.isAnonymous, user?.name]);

  const cycle = () => {
    sessionPairs[scope] = pickHomeCompanion(
      {
        firstName: companionFirstName(user?.name, user?.isAnonymous),
        hour: new Date().getHours(),
        titlesOnly,
      },
      sessionPairs[scope]
    );
    setPair(sessionPairs[scope] ?? null);
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
  const { pair } = useHomeCompanion();
  const phrase = pair?.greeting ?? null;
  const previousPhrase = useRef<string | null>(null);
  const isSwap = previousPhrase.current != null && phrase != null;

  useEffect(() => {
    previousPhrase.current = phrase;
  }, [phrase]);

  return (
    <h1
      aria-live="polite"
      className={cn(
        "hero-title mb-6 min-h-[1.15em] text-balance text-center font-semibold text-4xl tracking-tight md:mb-8 md:text-6xl",
        greetingMotionClass(phrase, isSwap)
      )}
      key={phrase}
    >
      {phrase ?? "\u00a0"}
    </h1>
  );
}

function greetingMotionClass(phrase: string | null, isSwap: boolean) {
  if (!phrase) {
    return "opacity-0";
  }
  if (isSwap) {
    return "home-greeting-swap";
  }
  return "home-greeting-enter";
}

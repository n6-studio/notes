import {
  createContext,
  type ReactNode,
  use,
  useEffect,
  useLayoutEffect,
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
  const titlesOnly = scope === "landing";
  const [pair, setPair] = useState<HomeCompanionPair | null>(
    () => sessionPairs[scope] ?? null
  );

  useLayoutEffect(() => {
    const ctx = {
      firstName: companionFirstName(user?.name, user?.isAnonymous),
      hour: new Date().getHours(),
      titlesOnly,
    };
    sessionPairs[scope] ??= pickHomeCompanion(ctx);
    setPair(sessionPairs[scope] ?? null);
  }, [scope, titlesOnly, user?.isAnonymous, user?.name]);

  const cycle = () => {
    const next = pickHomeCompanion(
      {
        firstName: companionFirstName(user?.name, user?.isAnonymous),
        hour: new Date().getHours(),
        titlesOnly,
      },
      sessionPairs[scope]
    );
    sessionPairs[scope] = next;
    setPair(next);
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
        "hero-title mb-10 min-h-[1.15em] text-balance text-center font-semibold text-4xl tracking-tight md:mb-16 md:text-6xl",
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

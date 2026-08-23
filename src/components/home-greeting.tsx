import { useEffect, useState } from "react";
import { useUser } from "~/lib/convex/use-user";
import { companionFirstName, pickHomeGreeting } from "~/lib/home-greeting";
import { cn } from "~/lib/utils";

let sessionPhrase: string | undefined;

export function HomeGreeting() {
  const { user } = useUser();
  const [phrase, setPhrase] = useState<string | null>(null);

  useEffect(() => {
    sessionPhrase ??= pickHomeGreeting({
      firstName: companionFirstName(user?.name, user?.isAnonymous),
      hour: new Date().getHours(),
    });
    setPhrase(sessionPhrase);
  }, [user?.isAnonymous, user?.name]);

  return (
    <h1
      aria-live="polite"
      className={cn(
        "hero-title mb-6 min-h-[1.15em] text-balance text-center font-semibold text-4xl tracking-tight md:mb-8 md:text-6xl",
        phrase ? "home-greeting-enter" : "opacity-0"
      )}
    >
      {phrase ?? "\u00a0"}
    </h1>
  );
}

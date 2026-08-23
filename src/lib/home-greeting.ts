export type DayPart = "morning" | "afternoon" | "evening" | "night";

const GUEST_NAME = /^guest[-_]/i;
const LOOKS_LIKE_EMAIL = /@/;
const WHITESPACE = /\s+/;

const NAMED_TIME_GREETINGS: Record<DayPart, (firstName: string) => string[]> = {
  morning: (firstName) => [`Morning, ${firstName}`, `Hey ${firstName}`],
  afternoon: (firstName) => [`Hey ${firstName}`, `Afternoon, ${firstName}`],
  evening: (firstName) => [`Evening, ${firstName}`, `Hey ${firstName}`],
  night: (firstName) => [`Still up, ${firstName}`, `Hey ${firstName}`],
};

const ANON_TIME_GREETINGS: Record<DayPart, string[]> = {
  morning: ["Good morning"],
  afternoon: ["Hey"],
  evening: ["Good evening"],
  night: ["Still up?"],
};

const COMPANION_GREETINGS = [
  "What's sitting with you?",
  "I'm here when you're ready",
  "Go on, get it out",
  "We'll hold onto it",
  "What's rattling around?",
  "Give it somewhere to land",
  "You don't have to finish it",
  "I'm listening",
  "Make a little room",
  "Whenever you're ready",
  "Catch it while it's here",
] as const;

export function companionFirstName(
  name: string | null | undefined,
  isAnonymous?: boolean | null
): string | undefined {
  if (isAnonymous) {
    return;
  }

  const trimmed = name?.trim();
  if (!trimmed || GUEST_NAME.test(trimmed) || LOOKS_LIKE_EMAIL.test(trimmed)) {
    return;
  }

  const first = trimmed.split(WHITESPACE)[0];
  if (!first || first.length < 2) {
    return;
  }

  return first;
}

export function dayPartFromHour(hour: number): DayPart {
  if (hour >= 5 && hour < 12) {
    return "morning";
  }
  if (hour >= 12 && hour < 17) {
    return "afternoon";
  }
  if (hour >= 17 && hour < 21) {
    return "evening";
  }
  return "night";
}

export function homeGreetingsFor({
  firstName,
  hour,
}: {
  firstName?: string;
  hour: number;
}): string[] {
  const dayPart = dayPartFromHour(hour);
  return [...timeGreetings(dayPart, firstName), ...COMPANION_GREETINGS];
}

export function pickHomeGreeting(
  ctx: { firstName?: string; hour: number },
  random = Math.random
): string {
  const pool = homeGreetingsFor(ctx);
  return pool[Math.floor(random() * pool.length)] ?? COMPANION_GREETINGS[0];
}

function timeGreetings(dayPart: DayPart, firstName?: string): string[] {
  if (firstName) {
    return NAMED_TIME_GREETINGS[dayPart](firstName);
  }

  return ANON_TIME_GREETINGS[dayPart];
}

export type DayPart = "morning" | "afternoon" | "evening" | "night";

export interface HomeCompanionPair {
  greeting: string;
  saveLabel: string;
}

const GUEST_NAME = /^guest[-_]/i;
const LOOKS_LIKE_EMAIL = /@/;
const WHITESPACE = /\s+/;

const COMPANION_PAIRS: HomeCompanionPair[] = [
  { greeting: "What's sitting with you?", saveLabel: "Dump it" },
  { greeting: "I'm here when you're ready", saveLabel: "Send it" },
  { greeting: "Go on, get it out", saveLabel: "Dump it" },
  { greeting: "We'll hold onto it", saveLabel: "Keep it" },
  { greeting: "What's rattling around?", saveLabel: "Catch it" },
  { greeting: "Give it somewhere to land", saveLabel: "Park it" },
  { greeting: "You don't have to finish it", saveLabel: "Toss it" },
  { greeting: "I'm listening", saveLabel: "Log it" },
  { greeting: "Make a little room", saveLabel: "Stash it" },
  { greeting: "Whenever you're ready", saveLabel: "Drop it" },
  { greeting: "Catch it while it's here", saveLabel: "Catch it" },
];

export const HOME_SAVE_LABEL_SIZER = COMPANION_PAIRS.reduce(
  (longest, pair) =>
    pair.saveLabel.length > longest.length ? pair.saveLabel : longest,
  "it"
);

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

export function homeCompanionsFor({
  firstName,
  hour,
  titlesOnly,
}: {
  firstName?: string;
  hour: number;
  titlesOnly?: boolean;
}): HomeCompanionPair[] {
  if (titlesOnly) {
    return [...COMPANION_PAIRS];
  }

  return [
    ...timeCompanions(dayPartFromHour(hour), firstName),
    ...COMPANION_PAIRS,
  ];
}

export function pickHomeCompanion(
  ctx: { firstName?: string; hour: number; titlesOnly?: boolean },
  previous?: HomeCompanionPair,
  random = Math.random
): HomeCompanionPair {
  const pool = homeCompanionsFor(ctx).filter(
    (pair) => pair.greeting !== previous?.greeting
  );
  return pool[Math.floor(random() * pool.length)] ?? COMPANION_PAIRS[0];
}

export interface CompanionUser {
  isAnonymous?: boolean | null;
  name?: string | null;
}

export function pickHomeCompanionForPage(
  page: "home" | "landing",
  user?: CompanionUser | null,
  random = Math.random
): HomeCompanionPair {
  return pickHomeCompanion(
    {
      firstName: companionFirstName(user?.name, user?.isAnonymous),
      hour: new Date().getHours(),
      titlesOnly: page === "landing",
    },
    undefined,
    random
  );
}

function timeCompanions(
  dayPart: DayPart,
  firstName?: string
): HomeCompanionPair[] {
  if (firstName) {
    return NAMED_TIME_COMPANIONS[dayPart](firstName);
  }

  return ANON_TIME_COMPANIONS[dayPart];
}

const NAMED_TIME_COMPANIONS: Record<
  DayPart,
  (firstName: string) => HomeCompanionPair[]
> = {
  morning: (firstName) => [
    { greeting: `Morning, ${firstName}`, saveLabel: "Send it" },
    { greeting: `Hey ${firstName}`, saveLabel: "Drop it" },
  ],
  afternoon: (firstName) => [
    { greeting: `Hey ${firstName}`, saveLabel: "Drop it" },
    { greeting: `Afternoon, ${firstName}`, saveLabel: "Park it" },
  ],
  evening: (firstName) => [
    { greeting: `Evening, ${firstName}`, saveLabel: "Drop it" },
    { greeting: `Hey ${firstName}`, saveLabel: "Drop it" },
  ],
  night: (firstName) => [
    { greeting: `Still up, ${firstName}`, saveLabel: "Dump it" },
    { greeting: `Hey ${firstName}`, saveLabel: "Drop it" },
  ],
};

const ANON_TIME_COMPANIONS: Record<DayPart, HomeCompanionPair[]> = {
  morning: [{ greeting: "Good morning", saveLabel: "Send it" }],
  afternoon: [{ greeting: "Hey", saveLabel: "Drop it" }],
  evening: [{ greeting: "Good evening", saveLabel: "Drop it" }],
  night: [{ greeting: "Still up?", saveLabel: "Dump it" }],
};

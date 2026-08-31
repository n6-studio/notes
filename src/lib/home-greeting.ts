import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";

export type DayPart = "morning" | "afternoon" | "evening" | "night";

export interface HomeCompanionPair {
  greeting: MessageDescriptor;
  saveLabel: MessageDescriptor;
}

const GUEST_NAME = /^guest[-_]/i;
const LOOKS_LIKE_EMAIL = /@/;
const WHITESPACE = /\s+/;

const COMPANION_PAIRS: HomeCompanionPair[] = [
  { greeting: msg`What's on your mind?`, saveLabel: msg`Save it` },
  { greeting: msg`I'm here when you're ready`, saveLabel: msg`Send it` },
  { greeting: msg`Write it down`, saveLabel: msg`Note it` },
  { greeting: msg`It's safe here`, saveLabel: msg`Hold it` },
  { greeting: msg`What do you want to keep?`, saveLabel: msg`Keep it` },
  { greeting: msg`Give it a place to land`, saveLabel: msg`Keep it` },
  { greeting: msg`You don't have to finish`, saveLabel: msg`Save it` },
  { greeting: msg`I'm listening`, saveLabel: msg`Add it` },
  { greeting: msg`Make a little room`, saveLabel: msg`Save it` },
  { greeting: msg`Whenever you're ready`, saveLabel: msg`Send it` },
  { greeting: msg`While it's still here`, saveLabel: msg`Keep it` },
];

export const HOME_SAVE_LABELS: MessageDescriptor[] = [
  ...new Map(
    COMPANION_PAIRS.map((pair) => [pair.saveLabel.message, pair.saveLabel])
  ).values(),
];

export const HOME_SAVE_LABEL_SIZER = HOME_SAVE_LABELS.reduce(
  (longest, label) =>
    (label.message?.length ?? 0) > (longest.message?.length ?? 0)
      ? label
      : longest
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

  const [first] = trimmed.split(WHITESPACE);
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
    ...(firstName ? namedCompanionPairs(firstName) : []),
    ...COMPANION_PAIRS,
  ];
}

export function sameCompanionGreeting(
  a: MessageDescriptor,
  b?: MessageDescriptor
): boolean {
  if (!b) {
    return false;
  }
  return (
    (a.id ?? a.message) === (b.id ?? b.message) &&
    a.values?.firstName === b.values?.firstName
  );
}

export function pickHomeCompanion(
  ctx: { firstName?: string; hour: number; titlesOnly?: boolean },
  previous?: HomeCompanionPair,
  random = Math.random
): HomeCompanionPair {
  const pool = homeCompanionsFor(ctx).filter(
    (pair) => !sameCompanionGreeting(pair.greeting, previous?.greeting)
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

function namedCompanionPairs(firstName: string): HomeCompanionPair[] {
  return [
    {
      greeting: msg`What's on your mind, ${firstName}?`,
      saveLabel: msg`Save it`,
    },
    { greeting: msg`I'm listening, ${firstName}`, saveLabel: msg`Add it` },
    {
      greeting: msg`Whenever you're ready, ${firstName}`,
      saveLabel: msg`Send it`,
    },
    {
      greeting: msg`You don't have to finish, ${firstName}`,
      saveLabel: msg`Save it`,
    },
    { greeting: msg`It's safe here, ${firstName}`, saveLabel: msg`Hold it` },
  ];
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
  afternoon: (firstName) => [
    { greeting: msg`Hey ${firstName}`, saveLabel: msg`Save it` },
    { greeting: msg`Afternoon, ${firstName}`, saveLabel: msg`Keep it` },
  ],
  evening: (firstName) => [
    { greeting: msg`Evening, ${firstName}`, saveLabel: msg`Save it` },
    { greeting: msg`Hey ${firstName}`, saveLabel: msg`Save it` },
  ],
  morning: (firstName) => [
    { greeting: msg`Morning, ${firstName}`, saveLabel: msg`Send it` },
    { greeting: msg`Hey ${firstName}`, saveLabel: msg`Save it` },
  ],
  night: (firstName) => [
    { greeting: msg`Still up, ${firstName}`, saveLabel: msg`Keep it` },
    { greeting: msg`Hey ${firstName}`, saveLabel: msg`Save it` },
  ],
};

const ANON_TIME_COMPANIONS: Record<DayPart, HomeCompanionPair[]> = {
  afternoon: [{ greeting: msg`Hey`, saveLabel: msg`Save it` }],
  evening: [{ greeting: msg`Good evening`, saveLabel: msg`Save it` }],
  morning: [{ greeting: msg`Good morning`, saveLabel: msg`Send it` }],
  night: [{ greeting: msg`Still up?`, saveLabel: msg`Keep it` }],
};

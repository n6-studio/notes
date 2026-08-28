export const locales = ["en", "it", "de", "fr", "es"] as const;

export type Locale = (typeof locales)[number];

export const sourceLocale: Locale = "en";

export const LOCALE_COOKIE = "locale";

export const localeCookieOptions = {
  maxAge: 60 * 60 * 24 * 365,
  path: "/",
} as const;

export const localeDisplayNames: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  es: "Español",
  fr: "Français",
  it: "Italiano",
};

const localeSet = new Set<string>(locales);

export function isLocale(value: string): value is Locale {
  return localeSet.has(value);
}

/** Map a tag like `it-IT` or `fr` to a supported locale; otherwise English. */
export function resolveLocale(value: string | undefined | null): Locale {
  const matched = matchLocale(value);
  return matched ?? sourceLocale;
}

export function matchLocale(
  value: string | undefined | null
): Locale | undefined {
  if (!value) {
    return;
  }

  const normalized = value.trim().toLowerCase().replaceAll("_", "-");
  if (isLocale(normalized)) {
    return normalized;
  }

  const [base] = normalized.split("-");
  if (base && isLocale(base)) {
    return base;
  }
}

export function localeFromAcceptLanguage(
  header: string | undefined | null
): Locale | undefined {
  if (!header) {
    return;
  }

  for (const part of header.split(",")) {
    const tag = part.split(";")[0]?.trim();
    const matched = matchLocale(tag);
    if (matched) {
      return matched;
    }
  }
}

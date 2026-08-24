import {
  LOCALE_COOKIE,
  type Locale,
  localeFromAcceptLanguage,
  matchLocale,
  resolveLocale,
  sourceLocale,
} from "./locales";

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) {
    return;
  }

  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }
    if (trimmed.slice(0, eq) !== name) {
      continue;
    }
    return decodeURIComponent(trimmed.slice(eq + 1));
  }
}

export function getLocaleFromRequest(request: Request): {
  locale: Locale;
  persist: boolean;
} {
  const query = new URL(request.url).searchParams.get("locale");
  if (query) {
    return { locale: resolveLocale(query), persist: true };
  }

  const cookie = readCookie(request, LOCALE_COOKIE);
  const cookieLocale = matchLocale(cookie);
  if (cookieLocale) {
    return { locale: cookieLocale, persist: cookieLocale !== cookie };
  }

  const fromHeader = localeFromAcceptLanguage(
    request.headers.get("accept-language")
  );
  return { locale: fromHeader ?? sourceLocale, persist: true };
}

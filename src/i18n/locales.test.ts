import { describe, expect, it } from "vitest";
import { getLocaleFromRequest } from "~/i18n/locale.server";
import {
  localeFromAcceptLanguage,
  resolveLocale,
  sourceLocale,
} from "~/i18n/locales";

describe("resolveLocale", () => {
  it("keeps supported locales and maps regional tags", () => {
    expect(resolveLocale("it")).toBe("it");
    expect(resolveLocale("it-IT")).toBe("it");
    expect(resolveLocale("de_DE")).toBe("de");
    expect(resolveLocale("xx")).toBe(sourceLocale);
  });
});

describe("localeFromAcceptLanguage", () => {
  it("picks the first supported tag", () => {
    expect(localeFromAcceptLanguage("it-IT,it;q=0.9,en;q=0.8")).toBe("it");
    expect(localeFromAcceptLanguage("sv,en;q=0.8")).toBe("en");
    expect(localeFromAcceptLanguage("sv")).toBeUndefined();
  });
});

describe("getLocaleFromRequest", () => {
  it("prefers the query string and then the cookie", () => {
    expect(
      getLocaleFromRequest(
        new Request("https://notes.test/?locale=fr", {
          headers: { cookie: "locale=it" },
        })
      )
    ).toEqual({ locale: "fr", persist: true });

    expect(
      getLocaleFromRequest(
        new Request("https://notes.test/", {
          headers: { cookie: "locale=de" },
        })
      )
    ).toEqual({ locale: "de", persist: false });
  });

  it("falls back to Accept-Language when no cookie is set", () => {
    expect(
      getLocaleFromRequest(
        new Request("https://notes.test/", {
          headers: { "accept-language": "es-ES,es;q=0.9" },
        })
      )
    ).toEqual({ locale: "es", persist: true });
  });

  it("ignores an invalid cookie and uses Accept-Language", () => {
    expect(
      getLocaleFromRequest(
        new Request("https://notes.test/", {
          headers: {
            cookie: "locale=xx",
            "accept-language": "de,en;q=0.8",
          },
        })
      )
    ).toEqual({ locale: "de", persist: true });
  });
});

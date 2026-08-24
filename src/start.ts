import { setupI18n } from "@lingui/core";
import { createMiddleware, createStart } from "@tanstack/react-start";
import { setCookie } from "@tanstack/react-start/server";
import { dynamicActivate } from "./i18n";
import { getLocaleFromRequest } from "./i18n/locale.server";
import { LOCALE_COOKIE, localeCookieOptions } from "./i18n/locales";

const linguiMiddleware = createMiddleware({ type: "request" }).server(
  async ({ next, request }) => {
    const { locale, persist } = getLocaleFromRequest(request);
    const i18n = setupI18n();
    await dynamicActivate(i18n, locale);

    const result = await next({
      context: { i18n, locale },
    });

    if (persist) {
      setCookie(LOCALE_COOKIE, locale, localeCookieOptions);
    }

    return result;
  }
);

export const startInstance = createStart(() => ({
  requestMiddleware: [linguiMiddleware],
}));

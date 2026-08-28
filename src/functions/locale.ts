import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "@tanstack/react-start/server";
import {
  LOCALE_COOKIE,
  localeCookieOptions,
  resolveLocale,
} from "~/i18n/locales";

export const updateLocale = createServerFn({ method: "POST" })
  .validator((locale: string) => resolveLocale(locale))
  .handler(({ data }) => {
    setCookie(LOCALE_COOKIE, data, localeCookieOptions);
  });

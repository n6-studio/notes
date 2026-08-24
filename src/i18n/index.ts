import type { I18n } from "@lingui/core";
import type { Locale } from "./locales";

export async function dynamicActivate(i18n: I18n, locale: Locale) {
  const { messages } = await import(`../locales/${locale}/messages.po`);
  i18n.loadAndActivate({ locale, messages });
}

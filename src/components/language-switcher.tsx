import { useLingui } from "@lingui/react/macro";
import { CheckIcon, LanguagesIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { updateLocale } from "~/functions/locale";
import { type Locale, localeDisplayNames, locales } from "~/i18n/locales";

export function LanguageSwitcher() {
  const { i18n, t } = useLingui();
  const activeLocale = i18n.locale;

  const onSelect = async (locale: Locale) => {
    if (locale === activeLocale) {
      return;
    }
    await updateLocale({ data: locale });
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label={t`Language`}
            className="text-muted-foreground hover:text-foreground"
            size="icon-sm"
            variant="ghost"
          />
        }
      >
        <LanguagesIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuGroup>
          {locales.map((locale) => (
            <DropdownMenuItem
              key={locale}
              onClick={() => {
                onSelect(locale).catch(() => {
                  /* cookie write failed; stay on current locale */
                });
              }}
            >
              <span className="flex-1">{localeDisplayNames[locale]}</span>
              {locale === activeLocale ? (
                <CheckIcon className="text-foreground" />
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

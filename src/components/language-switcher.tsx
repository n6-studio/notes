import { useLingui } from "@lingui/react/macro";
import { CheckIcon, LanguagesIcon } from "lucide-react";
import { useCallback } from "react";
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

function LanguageOption({
  activeLocale,
  locale,
}: {
  activeLocale: string;
  locale: Locale;
}) {
  const handleClick = useCallback(() => {
    if (locale === activeLocale) {
      return;
    }
    updateLocale({ data: locale })
      .then(() => {
        window.location.reload();
      })
      .catch(() => {
        /* cookie write failed; stay on current locale */
      });
  }, [activeLocale, locale]);

  return (
    <DropdownMenuItem onClick={handleClick}>
      <span className="flex-1">{localeDisplayNames[locale]}</span>
      {locale === activeLocale ? (
        <CheckIcon className="text-foreground" />
      ) : null}
    </DropdownMenuItem>
  );
}

export function LanguageSwitcher() {
  const { i18n, t } = useLingui();
  const activeLocale = i18n.locale;

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
            <LanguageOption
              activeLocale={activeLocale}
              key={locale}
              locale={locale}
            />
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

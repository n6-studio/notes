import { defineConfig } from "@lingui/cli";
import { formatter } from "@lingui/format-po";

export default defineConfig({
  catalogs: [
    {
      include: ["src"],
      path: "<rootDir>/src/locales/{locale}/messages",
    },
  ],
  format: formatter({ lineNumbers: false }),
  locales: ["en", "it", "de", "fr", "es"],
  sourceLocale: "en",
});

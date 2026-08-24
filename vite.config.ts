import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    devtools(),
    nitro({
      // Prefer Node entry on Vercel so TanStack Start keeps `runtime.node`
      // (web entry historically wiped it and caused SSR 500s).
      // NitroPluginConfig typings omit `vercel` in some nitro-nightly builds.
      // @ts-expect-error vercel is a valid Nitro deployment option
      vercel: { entryFormat: "node" },
      rollupConfig: { external: [/^@sentry\//] },
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});

export default config;

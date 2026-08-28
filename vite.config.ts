import { lingui } from "@lingui/vite-plugin";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const config = defineConfig({
  plugins: [
    devtools(),
    nitro(),
    tailwindcss(),
    lingui(),
    tanstackStart(),
    viteReact(),
    babel({
      plugins: ["@lingui/babel-plugin-lingui-macro"],
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  ssr: {
    noExternal: ["kitcn"],
  },
});

export default config;

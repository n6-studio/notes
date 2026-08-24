import { lingui } from "@lingui/vite-plugin";
import babel from "@rolldown/plugin-babel";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    lingui(),
    babel({
      plugins: ["@lingui/babel-plugin-lingui-macro"],
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    pool: "forks",
  },
});

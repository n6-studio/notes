import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SRC_ROOT = join(dirname(fileURLToPath(import.meta.url)));

const AUTH_SERVER_IMPORT = /from\s+["']~\/lib\/convex\/auth-server["']/;
const KITCN_AUTH_START_SERVER_IMPORT =
  /from\s+["']kitcn\/auth\/start\/server["']/;

const SERVER_ONLY_STATIC_IMPORTERS = new Set([
  "functions/get-auth.ts",
  "lib/convex/auth-server.ts",
  "lib/convex/server.ts",
  "routes/api/auth/$.ts",
]);

function collectSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(path));
      continue;
    }
    if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      files.push(path);
    }
  }
  return files;
}

describe("auth client boundary", () => {
  it("keeps kitcn auth server and auth-server out of client modules", () => {
    const leaks: string[] = [];

    for (const file of collectSourceFiles(SRC_ROOT)) {
      if (file.endsWith(".test.ts") || file.endsWith(".test.tsx")) {
        continue;
      }

      const relativePath = relative(SRC_ROOT, file);
      const source = readFileSync(file, "utf8");
      const allowed = SERVER_ONLY_STATIC_IMPORTERS.has(relativePath);

      if (!allowed && AUTH_SERVER_IMPORT.test(source)) {
        leaks.push(`${relativePath} statically imports auth-server`);
      }
      if (KITCN_AUTH_START_SERVER_IMPORT.test(source) && !allowed) {
        leaks.push(
          `${relativePath} statically imports kitcn/auth/start/server`
        );
      }
    }

    expect(leaks).toEqual([]);
  });
});

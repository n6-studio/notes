import type { AuthConfig } from "convex/server";
import { getAuthConfigProvider } from "kitcn/auth/config";

export default {
  providers: [getAuthConfigProvider()],
} satisfies AuthConfig;

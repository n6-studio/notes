import type { AuthConfig } from "convex/server";
import { getAuthConfigProvider } from "kitcn/auth/config";

const jwks = process.env.JWKS;

export default {
  providers: [jwks ? getAuthConfigProvider({ jwks }) : getAuthConfigProvider()],
} satisfies AuthConfig;

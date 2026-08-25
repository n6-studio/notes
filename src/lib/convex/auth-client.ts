import { anonymousClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { convexClient } from "kitcn/auth/client";
import { createAuthMutations } from "kitcn/react";

/**
 * Better Auth types `plugins` as BetterAuthClientPlugin[], so inline arrays widen and inferred client
 * APIs omit plugin-only routes (including `signIn.anonymous`). Preserve a concrete tuple type so both
 * `anonymousClient` and `convexClient` contribute `$InferServerPlugin` endpoints.
 */
const convexAuthPlugins = [anonymousClient(), convexClient()] as [
  ReturnType<typeof anonymousClient>,
  ReturnType<typeof convexClient>,
];

export const authClient = createAuthClient({
  baseURL:
    typeof window === "undefined"
      ? (import.meta.env.VITE_SITE_URL as string | undefined)
      : window.location.origin,
  plugins: convexAuthPlugins,
});

export const {
  useSignInMutationOptions,
  useSignOutMutationOptions,
  useSignUpMutationOptions,
  useSignInSocialMutationOptions,
} = createAuthMutations(authClient);

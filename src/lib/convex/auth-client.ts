import { convexClient } from "kitcn/auth/client";
import { anonymousClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { createAuthMutations } from "kitcn/react";

export const authClient = createAuthClient({
  baseURL:
    typeof window === "undefined"
      ? (import.meta.env.VITE_SITE_URL as string | undefined)
      : window.location.origin,
  plugins: [anonymousClient(), convexClient()],
});

export const {
  useSignInMutationOptions,
  useSignOutMutationOptions,
  useSignUpMutationOptions,
  useSignInSocialMutationOptions,
} = createAuthMutations(authClient);

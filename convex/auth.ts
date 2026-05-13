import { anonymous } from "better-auth/plugins";
import type { RegisteredQuery } from "convex/server";
import { asyncMap } from "convex-helpers";
import { convex } from "kitcn/auth";
import type { Id } from "./_generated/dataModel.js";
import authConfig from "./auth.config.js";
import { defineAuth } from "./generated/auth.js";
import type { MutationCtx } from "./generated/server.js";
import { type AppUser, safeGetUser } from "./lib/app_user.js";
import { publicQuery } from "./lib/crpc.js";
import { authQuery } from "./lib/protected.js";

function mutationCtx(ctx: MutationCtx | unknown): MutationCtx {
  return ctx as MutationCtx;
}

/** Synthetic email domain for anonymous users — non-deliverable, scoped by site host when possible. */
function guestEmailDomain(baseUrl: string): string {
  try {
    const host = new URL(baseUrl).hostname;
    return host === "localhost" || host === "127.0.0.1"
      ? "guest.local"
      : `guest.${host}`;
  } catch {
    return "guest.local";
  }
}

export { getUser, safeGetUser } from "./lib/app_user.js";

/** Public identity probe — returns null when there is no Convex auth identity. */
export const me = publicQuery.query(async ({ ctx }) => {
  const user = await safeGetUser(ctx);
  return user ?? null;
}) as RegisteredQuery<"public", Record<string, never>, AppUser | null>;

export const getCurrentUser = authQuery.query(
  async ({ ctx }) => ctx.user
) as RegisteredQuery<"public", Record<string, never>, AppUser>;

const siteUrl = process.env.SITE_URL;

export default defineAuth(() => {
  if (!siteUrl) {
    throw new Error("SITE_URL is not set");
  }

  return {
    baseURL: siteUrl,
    trustedOrigins: [siteUrl],
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    plugins: [
      anonymous({
        emailDomainName: guestEmailDomain(siteUrl),
        generateName: async () =>
          `Guest-${Math.random().toString(36).slice(2, 10)}`,
      }),
      convex({
        authConfig,
        jwks: process.env.JWKS,
      }),
    ],
    triggers: {
      user: {
        delete: {
          after: async (authUser, ctx) => {
            const { db, storage } = mutationCtx(ctx);
            const authUserId = authUser._id as Id<"user">;

            const notes = await db
              .query("notes")
              .withIndex("by_user", (q) => q.eq("userId", authUserId))
              .collect();

            await asyncMap(notes, async (note) => {
              const attachments = await db
                .query("attachments")
                .withIndex("by_note", (q) => q.eq("noteId", note._id))
                .collect();
              await asyncMap(attachments, async (att) => {
                await storage.delete(att.storageId);
                await db.delete(att._id);
              });
              await db.delete(note._id);
            });
          },
        },
      },
    },
  };
});

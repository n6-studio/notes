import { anonymous } from "better-auth/plugins/anonymous";
import type { RegisteredQuery } from "convex/server";
import { asyncMap } from "convex-helpers";
import { convex } from "kitcn/auth";
import type { Id } from "./_generated/dataModel.js";
import authConfig from "./auth.config.js";
import { defineAuth } from "./generated/auth.js";
import type { MutationCtx } from "./generated/server.js";
import type { AppUser } from "./lib/app_user.js";
import { authQuery } from "./lib/protected.js";

function mutationCtx(ctx: MutationCtx | unknown): MutationCtx {
  return ctx as MutationCtx;
}

export { getUser, safeGetUser } from "./lib/app_user.js";

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
      anonymous(),
      convex({
        authConfig,
      }),
    ],
    triggers: {
      user: {
        create: {
          after: async (authUser, ctx) => {
            const { db } = mutationCtx(ctx);
            const authUserId = authUser._id as Id<"user">;
            const appUserId = await db.insert("users", {
              authId: authUserId,
              username: authUser.username ?? undefined,
              isAnonymous: authUser.isAnonymous === true,
            });
            await db.patch(authUserId, { userId: appUserId });
          },
        },
        update: {
          after: async (newUser, ctx) => {
            const { db } = mutationCtx(ctx);
            const appUserId = newUser.userId as Id<"users"> | undefined;
            if (!appUserId) {
              return;
            }
            await db.patch(appUserId, {
              authId: newUser._id as Id<"user">,
              username: newUser.username ?? undefined,
              isAnonymous: newUser.isAnonymous === true,
            });
          },
        },
        delete: {
          after: async (authUser, ctx) => {
            const { db, storage } = mutationCtx(ctx);
            const userId = authUser.userId as Id<"users"> | undefined;
            if (!userId) {
              return;
            }
            const user = await db.get(userId);
            if (!user) {
              return;
            }

            const notes = await db
              .query("notes")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
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

            await db.delete(user._id);
          },
        },
      },
    },
  };
});

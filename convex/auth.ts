import {
  type AuthFunctions,
  createClient,
  type GenericCtx,
} from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { type BetterAuthOptions, betterAuth } from "better-auth/minimal";
import { anonymous } from "better-auth/plugins/anonymous";
import { ConvexError } from "convex/values";
import { asyncMap, withoutSystemFields } from "convex-helpers";
import { components, internal } from "./_generated/api.js";
import type { DataModel, Id } from "./_generated/dataModel.js";
import { type QueryCtx, query } from "./_generated/server.js";
import authConfig from "./auth.config.js";
import betterAuthSchema from "./betterAuth/schema.js";

const siteUrl = process.env.SITE_URL;

const authFunctions: AuthFunctions = internal.auth;

export const authComponent = createClient<DataModel, typeof betterAuthSchema>(
  components.betterAuth,
  {
    authFunctions,
    local: {
      schema: betterAuthSchema,
    },
    verbose: false,
    triggers: {
      user: {
        onCreate: async (ctx, authUser) => {
          const userId = await ctx.db.insert("users", {
            authId: authUser._id,
            username: authUser.username ?? undefined,
            isAnonymous: authUser.isAnonymous === true,
          });
          await authComponent.setUserId(ctx, authUser._id, userId as string);
        },
        onUpdate: async (ctx, newUser, oldUser) => {
          if (
            oldUser.username === newUser.username &&
            oldUser.isAnonymous === newUser.isAnonymous
          ) {
            return;
          }
          const appUserId = newUser.userId;
          if (!appUserId) {
            return;
          }
          await ctx.db.patch(appUserId as Id<"users">, {
            authId: newUser._id,
            username: newUser.username ?? undefined,
            isAnonymous: newUser.isAnonymous === true,
          });
        },
        onDelete: async (ctx, authUser) => {
          const userId = authUser.userId as Id<"users"> | undefined;
          if (!userId) {
            return;
          }
          const user = await ctx.db.get(userId);
          if (!user) {
            return;
          }

          const notes = await ctx.db
            .query("notes")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

          await asyncMap(notes, async (note) => {
            const attachments = await ctx.db
              .query("attachments")
              .withIndex("by_note", (q) => q.eq("noteId", note._id))
              .collect();
            await asyncMap(attachments, async (att) => {
              await ctx.storage.delete(att.storageId);
              await ctx.db.delete(att._id);
            });
            await ctx.db.delete(note._id);
          });

          await ctx.db.delete(user._id);
        },
      },
    },
  }
);

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();

export const { getAuthUser } = authComponent.clientApi();

export const createAuthOptions = (ctx: GenericCtx<DataModel>) =>
  ({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    plugins: [anonymous(), convex({ authConfig })],
  }) satisfies BetterAuthOptions;

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth(createAuthOptions(ctx));

export const safeGetUser = async (ctx: QueryCtx) => {
  const authUser = await authComponent.safeGetAuthUser(ctx);
  if (!authUser) {
    return;
  }
  const user = await ctx.db.get(authUser.userId as Id<"users">);
  if (!user) {
    return;
  }
  return { ...user, ...withoutSystemFields(authUser) };
};

export const getUser = async (ctx: QueryCtx) => {
  const user = await safeGetUser(ctx);
  if (!user) {
    throw new ConvexError("Unauthenticated");
  }
  return user;
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => await getUser(ctx),
});

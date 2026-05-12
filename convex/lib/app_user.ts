import { withoutSystemFields } from "convex-helpers";
import { getAuthUserIdentity } from "kitcn/auth";
import { CRPCError } from "kitcn/server";
import type { Id } from "../_generated/dataModel.js";
import type { MutationCtx, QueryCtx } from "../_generated/server.js";

export type AppCtx = QueryCtx | MutationCtx;

export async function safeGetUser(ctx: AppCtx) {
  const identity = await getAuthUserIdentity(ctx);
  if (!identity) {
    return;
  }
  const authUser = await ctx.db.get(identity.userId as Id<"user">);
  if (!authUser) {
    return;
  }
  const appUserId = authUser.userId;
  if (!appUserId) {
    return;
  }
  const user = await ctx.db.get(appUserId);
  if (!user) {
    return;
  }
  return { ...user, ...withoutSystemFields(authUser) };
}

export async function getUser(ctx: AppCtx) {
  const user = await safeGetUser(ctx);
  if (!user) {
    throw new CRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthenticated",
    });
  }
  return user;
}

export type AppUser = NonNullable<Awaited<ReturnType<typeof safeGetUser>>>;

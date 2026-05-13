import { getAuthUserIdentity } from "kitcn/auth";
import { CRPCError } from "kitcn/server";
import type { Id } from "../_generated/dataModel.js";
import type { MutationCtx, QueryCtx } from "../generated/server.js";

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
  return authUser;
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

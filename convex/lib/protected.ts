import { CRPCError } from "kitcn/server";
import type { Id } from "../_generated/dataModel.js";
import { safeGetUser } from "./app_user.js";
import { publicMutation, publicQuery } from "./crpc.js";

export const authQuery = publicQuery.use(async ({ ctx, next }) => {
  const user = await safeGetUser(ctx);
  if (!user) {
    throw new CRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthenticated",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user,
      userId: user._id as Id<"users">,
    },
  });
});

export const authMutation = publicMutation.use(async ({ ctx, next }) => {
  const user = await safeGetUser(ctx);
  if (!user) {
    throw new CRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthenticated",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user,
      userId: user._id as Id<"users">,
    },
  });
});

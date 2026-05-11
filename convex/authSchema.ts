import { defineTable } from "convex/server";
import { v } from "convex/values";

export const authSchema = {
  account: defineTable({
    accountId: v.string(),
    providerId: v.string(),
    userId: v.id("user"),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    idToken: v.optional(v.string()),
    accessTokenExpiresAt: v.optional(v.number()),
    refreshTokenExpiresAt: v.optional(v.number()),
    scope: v.optional(v.string()),
    password: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("accountId", ["accountId"])
    .index("accountId_providerId", ["accountId", "providerId"])
    .index("providerId_userId", ["providerId", "userId"])
    .index("userId", ["userId"]),
  jwks: defineTable({
    publicKey: v.string(),
    privateKey: v.string(),
    createdAt: v.number(),
  }),
  session: defineTable({
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    userId: v.id("user"),
  })
    .index("token", ["token"])
    .index("userId", ["userId"])
    .index("expiresAt", ["expiresAt"])
    .index("expiresAt_userId", ["expiresAt", "userId"]),
  user: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    userId: v.optional(v.id("users")),
    isAnonymous: v.optional(v.boolean()),
    username: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("userId", ["userId"])
    .index("username", ["username"]),
  verification: defineTable({
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.number(),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("identifier", ["identifier"])
    .index("expiresAt", ["expiresAt"]),
};

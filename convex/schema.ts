import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authSchema } from "./authSchema.js";

export default defineSchema({
  ...authSchema,
  users: defineTable({
    authId: v.string(),
    username: v.optional(v.string()),
    isAnonymous: v.boolean(),
  }).index("by_authId", ["authId"]),

  notes: defineTable({
    userId: v.id("users"),
    body: v.string(),
    label: v.optional(v.string()),
    linkUrl: v.optional(v.string()),
    /** Legacy capture timestamp; run `migrations:migrateRemindAtToTargetAt` then remove this field. */
    remindAt: v.optional(v.number()),
    targetAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .searchIndex("search_notes", {
      searchField: "body",
      filterFields: ["userId"],
    }),

  attachments: defineTable({
    noteId: v.id("notes"),
    userId: v.id("users"),
    storageId: v.id("_storage"),
    contentType: v.optional(v.string()),
  })
    .index("by_note", ["noteId"])
    .index("by_user", ["userId"]),
});

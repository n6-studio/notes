import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authSchema } from "./authSchema";

export default defineSchema({
  ...authSchema,

  attachments: defineTable({
    contentType: v.optional(v.string()),
    noteId: v.id("notes"),
    storageId: v.id("_storage"),
    userId: v.id("user"),
  })
    .index("by_note", ["noteId"])
    .index("by_user", ["userId"]),

  notes: defineTable({
    body: v.string(),
    label: v.optional(v.string()),
    linkUrl: v.optional(v.string()),
    /** Legacy capture timestamp; run `migrations:migrateRemindAtToTargetAt` then remove this field. */
    remindAt: v.optional(v.number()),
    targetAt: v.optional(v.number()),
    userId: v.id("user"),
  })
    .index("by_user", ["userId"])
    .searchIndex("search_notes", {
      filterFields: ["userId"],
      searchField: "body",
    }),
});

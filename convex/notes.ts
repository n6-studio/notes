import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server.js";
import { getUser } from "./auth.js";

function filterByDates<T extends { _creationTime: number }>(
  rows: T[],
  dateFrom?: number,
  dateTo?: number
): T[] {
  if (dateFrom === undefined && dateTo === undefined) {
    return rows;
  }
  return rows.filter((row) => {
    if (dateFrom !== undefined && row._creationTime < dateFrom) {
      return false;
    }
    if (dateTo !== undefined && row._creationTime > dateTo) {
      return false;
    }
    return true;
  });
}

export const list = query({
  args: {
    q: v.optional(v.string()),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
    sort: v.optional(v.union(v.literal("desc"), v.literal("asc"))),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const sort = args.sort ?? "desc";
    const qText = args.q?.trim();

    if (qText) {
      const found = await ctx.db
        .query("notes")
        .withSearchIndex("search_notes", (sq) =>
          sq.search("body", qText).eq("userId", user._id)
        )
        .take(200);
      const filtered = filterByDates(found, args.dateFrom, args.dateTo);
      return filtered.sort((a, b) =>
        sort === "desc"
          ? b._creationTime - a._creationTime
          : a._creationTime - b._creationTime
      );
    }

    const ordered = await ctx.db
      .query("notes")
      .withIndex("by_user", (qi) => qi.eq("userId", user._id))
      .order(sort)
      .take(500);

    return filterByDates(ordered, args.dateFrom, args.dateTo);
  },
});

export const get = query({
  args: { id: v.id("notes") },
  handler: async (ctx, { id }) => {
    const user = await getUser(ctx);
    const note = await ctx.db.get(id);
    if (!note || note.userId !== user._id) {
      throw new ConvexError("Not found");
    }
    const attachments = await ctx.db
      .query("attachments")
      .withIndex("by_note", (q) => q.eq("noteId", id))
      .collect();
    return { note, attachments };
  },
});

export const create = mutation({
  args: {
    body: v.string(),
    label: v.optional(v.string()),
    linkUrl: v.optional(v.string()),
    remindAt: v.optional(v.number()),
    storageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const trimmedLink = args.linkUrl?.trim();
    const body = args.body.trim();
    if (
      !(body || (args.storageIds && args.storageIds.length > 0) || trimmedLink)
    ) {
      throw new ConvexError("Note is empty");
    }

    const noteId = await ctx.db.insert("notes", {
      userId: user._id,
      body: body || trimmedLink || "(attachment)",
      label: args.label,
      linkUrl: trimmedLink,
      remindAt: args.remindAt,
    });

    if (args.storageIds?.length) {
      for (const storageId of args.storageIds) {
        await ctx.db.insert("attachments", {
          noteId,
          userId: user._id,
          storageId,
        });
      }
    }

    return noteId;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await getUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const getAttachmentUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const user = await getUser(ctx);
    const mine = await ctx.db
      .query("attachments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const att = mine.find((a) => a.storageId === storageId);
    if (!att) {
      throw new ConvexError("Not found");
    }
    return await ctx.storage.getUrl(storageId);
  },
});

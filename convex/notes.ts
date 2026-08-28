import type { RegisteredMutation, RegisteredQuery } from "convex/server";
import { CRPCError, zid } from "kitcn/server";
import { z } from "zod";
import type { DataModel, Doc, Id } from "./_generated/dataModel.js";
import { authMutation, authQuery } from "./lib/protected.js";

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

const listInputSchema = z.object({
  dateFrom: z.number().optional(),
  dateTo: z.number().optional(),
  label: z.enum(["note", "todo", "link", "idea"]).optional(),
  q: z.string().optional(),
  sort: z.enum(["desc", "asc"]).optional(),
});

export const list = authQuery
  .input(listInputSchema)
  .query(async ({ ctx, input }) => {
    const { user } = ctx;
    const sort = input.sort ?? "desc";
    const qText = input.q?.trim();
    const labelFilter = input.label;

    function filterByLabel(rows: Doc<"notes">[]): Doc<"notes">[] {
      if (labelFilter === undefined) {
        return rows;
      }
      return rows.filter((row) => row.label === labelFilter);
    }

    if (qText) {
      const found = await ctx.db
        .query("notes")
        .withSearchIndex("search_notes", (sq) =>
          sq.search("body", qText).eq("userId", user._id)
        )
        .take(200);
      const filtered = filterByLabel(
        filterByDates(found, input.dateFrom, input.dateTo)
      );
      filtered.sort((a, b) =>
        sort === "desc"
          ? b._creationTime - a._creationTime
          : a._creationTime - b._creationTime
      );
      return filtered;
    }

    const ordered = await ctx.db
      .query("notes")
      .withIndex("by_user", (qi) => qi.eq("userId", user._id))
      .order(sort)
      .take(500);

    return filterByLabel(filterByDates(ordered, input.dateFrom, input.dateTo));
  }) as RegisteredQuery<
  "public",
  z.infer<typeof listInputSchema>,
  Doc<"notes">[]
>;

const getInputSchema = z.object({
  id: zid<DataModel>("notes"),
});

export const get = authQuery
  .input(getInputSchema)
  .query(async ({ ctx, input }) => {
    const { user } = ctx;
    const id = input.id as Id<"notes">;
    const note = await ctx.db.get(id);
    if (!note || note.userId !== user._id) {
      throw new CRPCError({
        code: "NOT_FOUND",
        message: "Not found",
      });
    }
    const attachments = await ctx.db
      .query("attachments")
      .withIndex("by_note", (q) => q.eq("noteId", id))
      .collect();
    return { attachments, note };
  }) as RegisteredQuery<
  "public",
  z.infer<typeof getInputSchema>,
  { note: Doc<"notes">; attachments: Doc<"attachments">[] }
>;

const createInputSchema = z.object({
  body: z.string(),
  label: z.string().optional(),
  linkUrl: z.string().optional(),
  storageIds: z
    .array(z.custom<Id<"_storage">>((v) => typeof v === "string"))
    .optional(),
  targetAt: z.number().optional(),
});

export const create = authMutation
  .input(createInputSchema)
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const trimmedLink = input.linkUrl?.trim();
    const body = input.body.trim();
    if (
      !(
        body ||
        (input.storageIds && input.storageIds.length > 0) ||
        trimmedLink
      )
    ) {
      throw new CRPCError({
        code: "BAD_REQUEST",
        message: "Note is empty",
      });
    }

    const noteId = await ctx.db.insert("notes", {
      body: body || trimmedLink || "(attachment)",
      label: input.label,
      linkUrl: trimmedLink,
      targetAt: input.targetAt,
      userId: user._id,
    });

    if (input.storageIds?.length) {
      await Promise.all(
        input.storageIds.map((storageId) =>
          ctx.db.insert("attachments", {
            noteId,
            storageId,
            userId: user._id,
          })
        )
      );
    }

    return noteId;
  }) as RegisteredMutation<
  "public",
  z.infer<typeof createInputSchema>,
  Id<"notes">
>;

export const generateUploadUrl = authMutation.mutation(async ({ ctx }) =>
  ctx.storage.generateUploadUrl()
) as RegisteredMutation<"public", Record<string, never>, string>;

const removeInputSchema = z.object({
  id: zid<DataModel>("notes"),
});

export const remove = authMutation
  .input(removeInputSchema)
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const id = input.id as Id<"notes">;
    const note = await ctx.db.get(id);
    if (!note || note.userId !== user._id) {
      throw new CRPCError({
        code: "NOT_FOUND",
        message: "Not found",
      });
    }

    const attachments = await ctx.db
      .query("attachments")
      .withIndex("by_note", (q) => q.eq("noteId", id))
      .collect();

    await Promise.all(
      attachments.map(async (att) => {
        await ctx.storage.delete(att.storageId);
        await ctx.db.delete(att._id);
      })
    );

    await ctx.db.delete(id);
  }) as RegisteredMutation<
  "public",
  z.infer<typeof removeInputSchema>,
  undefined
>;

const attachmentUrlInputSchema = z.object({
  storageId: z.custom<Id<"_storage">>((v) => typeof v === "string"),
});

export const getAttachmentUrl = authQuery
  .input(attachmentUrlInputSchema)
  .query(async ({ ctx, input }) => {
    const { user } = ctx;
    const { storageId } = input;
    const mine = await ctx.db
      .query("attachments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const att = mine.find((a) => a.storageId === storageId);
    if (!att) {
      throw new CRPCError({
        code: "NOT_FOUND",
        message: "Not found",
      });
    }
    return await ctx.storage.getUrl(storageId);
  }) as RegisteredQuery<
  "public",
  z.infer<typeof attachmentUrlInputSchema>,
  string | null
>;

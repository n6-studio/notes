import { ConvexHttpClient } from "convex/browser";

import { authClient } from "~/lib/convex/auth-client";
import { api } from "../../../convex/_generated/api.js";
import type { Id } from "../../../convex/_generated/dataModel.js";

/** Shared input for creating a note from the chat composer (files uploaded first when non-empty). */
export interface ChatComposerNotePayload {
  body: string;
  files: File[];
  label: string;
  linkUrl: string | undefined;
  targetAt: number | undefined;
}

export interface ChatComposerCrpcMutations {
  createNote: (args: {
    body: string;
    label: string;
    linkUrl?: string;
    targetAt?: number;
    storageIds?: Id<"_storage">[];
  }) => Promise<unknown>;
  generateUploadUrl: () => Promise<string>;
}

export async function uploadNoteFiles(
  files: File[],
  getUploadPostUrl: () => Promise<string>
): Promise<Id<"_storage">[]> {
  return await Promise.all(
    files.map(async (file) => {
      const postUrl = await getUploadPostUrl();
      const res = await fetch(postUrl, {
        body: file,
        headers: { "Content-Type": file.type },
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Upload failed");
      }
      const json = (await res.json()) as { storageId: Id<"_storage"> };
      return json.storageId;
    })
  );
}

function requireConvexUrl(): string {
  const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
  if (!convexUrl) {
    throw new Error("VITE_CONVEX_URL is not set");
  }
  return convexUrl;
}

async function convexJwtFromSession(): Promise<string> {
  const tokenRes = await authClient.convex.token({
    fetchOptions: { credentials: "include", throw: true },
  });
  const jwt = tokenRes.token;
  if (!jwt) {
    throw new Error("Could not get Convex session");
  }
  return jwt;
}

/** Convex mutations over HTTP (avoids WebSocket auth lag after sign-in). */
export async function submitNoteCaptureOverHttp(
  payload: ChatComposerNotePayload
): Promise<void> {
  const httpClient = new ConvexHttpClient(requireConvexUrl());
  httpClient.setAuth(await convexJwtFromSession());

  const storageIds = await uploadNoteFiles(payload.files, () =>
    httpClient.mutation(api.notes.generateUploadUrl, {})
  );

  await httpClient.mutation(api.notes.create, {
    body: payload.body,
    label: payload.label,
    linkUrl: payload.linkUrl,
    storageIds: storageIds.length ? storageIds : undefined,
    targetAt: payload.targetAt,
  });
}

/** Same flow via CRPC / ConvexReactClient (WebSocket). */
export async function submitNoteCaptureOverCrpc(
  payload: ChatComposerNotePayload,
  mutations: ChatComposerCrpcMutations
): Promise<void> {
  const storageIds = await uploadNoteFiles(payload.files, () =>
    mutations.generateUploadUrl()
  );

  await mutations.createNote({
    body: payload.body,
    label: payload.label,
    linkUrl: payload.linkUrl,
    storageIds: storageIds.length ? storageIds : undefined,
    targetAt: payload.targetAt,
  });
}

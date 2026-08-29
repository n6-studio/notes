import { createIsomorphicFn, createServerFn } from "@tanstack/react-start";
import { getToken } from "~/lib/convex/auth-server";

export const getAuth = createServerFn({ method: "GET" }).handler(
  async () => (await getToken()) ?? null
);

/** SSR runs in-process; the browser calls getAuth over RPC. */
export const loadAuthToken = createIsomorphicFn()
  .client(() => getAuth())
  .server(async () => (await getToken()) ?? null);

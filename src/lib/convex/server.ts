import { getRequestHeaders } from "@tanstack/react-start/server";
import { createCallerFactory } from "kitcn/server";
import { getToken } from "~/lib/convex/auth-server";
import { api } from "../../../convex/_generated/api.js";

const { createContext, createCaller } = createCallerFactory({
  api,
  convexSiteUrl: import.meta.env.VITE_CONVEX_SITE_URL ?? "",
  auth: {
    getToken: async () => ({
      token: await getToken(),
    }),
  },
});

type ServerCaller = ReturnType<typeof createCaller>;

async function makeContext() {
  const headers = await getRequestHeaders();
  return createContext({ headers });
}

function createServerCaller(): ServerCaller {
  return createCaller(async () => makeContext());
}

export function runServerCall<T>(
  fn: (caller: ServerCaller) => Promise<T> | T
): Promise<T> | T {
  const caller = createServerCaller();
  return fn(caller);
}

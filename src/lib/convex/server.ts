import { createCaller } from "~/lib/convex/auth-server";

/** Request-scoped cRPC caller — every procedure in a request shares one token fetch. */
export const caller = createCaller();

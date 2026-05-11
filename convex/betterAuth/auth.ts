import { createAuth } from "../auth.js";

export const auth = createAuth({} as Parameters<typeof createAuth>[0]);

import { initCRPC } from "kitcn/server";
import type { DataModel } from "../_generated/dataModel.js";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "../_generated/server.js";

const c = initCRPC.dataModel<DataModel>().create({
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
});

export { c };
export const publicQuery = c.query;
export const publicMutation = c.mutation;

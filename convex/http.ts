import { httpRouter } from "convex/server";
import { registerRoutes } from "kitcn/auth/http";
import { getAuth } from "./generated/auth.js";

const siteUrl = process.env.SITE_URL;
if (!siteUrl) {
  throw new Error("SITE_URL is not set");
}

const http = httpRouter();

registerRoutes(http, getAuth, {
  cors: {
    allowedOrigins: [siteUrl],
  },
});

export default http;

import { describe, expect, it } from "vitest";
import { betterAuthTrustedOrigins } from "./trusted_origins";

describe("betterAuthTrustedOrigins", () => {
  it("trusts Vite fallback loopback ports in development", () => {
    expect(
      betterAuthTrustedOrigins("http://localhost:3000", "development")
    ).toEqual([
      "http://localhost:3000",
      "http://localhost:*",
      "http://127.0.0.1:*",
      "http://[::1]:*",
    ]);
  });

  it("does not widen origins outside development", () => {
    expect(
      betterAuthTrustedOrigins("https://notes.example.com", "production")
    ).toEqual(["https://notes.example.com"]);
  });
});

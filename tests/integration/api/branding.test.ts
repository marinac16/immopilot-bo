import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.API_URL = "http://localhost:4000";
  process.env.API_KEY = "test-api-key";
});

describe("branding API", () => {
  it("getBranding returns branding config", async () => {
    const { getBranding } = await import("@/lib/api/branding");
    const branding = await getBranding("user-1");
    expect(branding.userId).toBe("user-1");
  });

  it("upsertBranding saves the config", async () => {
    const { upsertBranding } = await import("@/lib/api/branding");
    const branding = await upsertBranding("user-1", {
      emailHeaderUrl: "https://example.com/header.png",
    });
    expect(branding.userId).toBe("user-1");
  });
});

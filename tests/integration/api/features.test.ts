import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.API_URL = "http://localhost:4000";
  process.env.API_KEY = "test-api-key";
});

describe("features API", () => {
  it("getAllFeatures returns all features", async () => {
    const { getAllFeatures } = await import("@/lib/api/features");
    const features = await getAllFeatures();
    expect(Array.isArray(features)).toBe(true);
    expect(features[0]).toMatchObject({ id: "feat-1", name: "gmail_parser" });
  });

  it("getAllFeatures returns feature names", async () => {
    const { getAllFeatures } = await import("@/lib/api/features");
    const features = await getAllFeatures();
    const names = features.map((f) => f.name);
    expect(names).toContain("gmail_parser");
  });
});

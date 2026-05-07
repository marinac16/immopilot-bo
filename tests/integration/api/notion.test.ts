import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.API_URL = "http://localhost:4000";
  process.env.API_KEY = "test-api-key";
});

describe("notion API", () => {
  it("getNotionConfig returns the config bound to a userId", async () => {
    const { getNotionConfig } = await import("@/lib/api/notion");
    const config = await getNotionConfig("user-1");
    expect(config.userId).toBe("user-1");
    expect(config.notionToken).toBeNull();
  });

  it("upsertNotionConfig persists fields and echoes the userId from the path", async () => {
    const { upsertNotionConfig } = await import("@/lib/api/notion");
    const config = await upsertNotionConfig("user-1", {
      notionToken: "secret_abc",
      leadsAcquereurs: "db-leads-id",
    });
    expect(config.userId).toBe("user-1");
    expect(config.notionToken).toBe("secret_abc");
    expect(config.leadsAcquereurs).toBe("db-leads-id");
  });

  it("upsertNotionConfig keeps userId from the URL even if the body has a different one", async () => {
    const { upsertNotionConfig } = await import("@/lib/api/notion");
    const config = await upsertNotionConfig("user-1", {
      notionToken: "secret_xyz",
    });
    expect(config.userId).toBe("user-1");
  });
});

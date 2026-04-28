import { describe, it, expect } from "vitest";
import { NotionConfigSchema, UpdateNotionConfigSchema } from "@/lib/schemas/notion.schema";

describe("NotionConfigSchema", () => {
  it("parses a valid config with all fields", () => {
    const raw = {
      userId: "user-1",
      notionToken: "secret_abc",
      leadsAcquereurs: "db-leads-id",
      visites: "db-visites-id",
      biens: "db-biens-id",
    };
    expect(() => NotionConfigSchema.parse(raw)).not.toThrow();
  });

  it("parses minimal config with only userId", () => {
    expect(() => NotionConfigSchema.parse({ userId: "1" })).not.toThrow();
  });

  it("accepts null for optional fields", () => {
    const config = NotionConfigSchema.parse({ userId: "1", notionToken: null });
    expect(config.notionToken).toBeNull();
  });
});

describe("UpdateNotionConfigSchema", () => {
  it("allows partial updates", () => {
    expect(() => UpdateNotionConfigSchema.parse({ notionToken: "secret_x" })).not.toThrow();
  });

  it("allows empty object", () => {
    expect(() => UpdateNotionConfigSchema.parse({})).not.toThrow();
  });
});

import { describe, it, expect } from "vitest";
import { parseNotionPageId, formatNotionUuid } from "@/lib/notion-utils";

describe("parseNotionPageId", () => {
  it("extracts 32 hex from a Notion URL", () => {
    const url =
      "https://notion.so/workspace/ImmoPilot-MASTER-8c5298e1fcc78308a108813c64979f04";
    expect(parseNotionPageId(url)).toBe("8c5298e1fcc78308a108813c64979f04");
  });

  it("returns UUID as-is", () => {
    const uuid = "8c5298e1-fcc7-8308-a108-813c64979f04";
    expect(parseNotionPageId(uuid)).toBe(uuid);
  });

  it("returns raw 32 hex as-is", () => {
    expect(parseNotionPageId("8c5298e1fcc78308a108813c64979f04")).toBe(
      "8c5298e1fcc78308a108813c64979f04"
    );
  });

  it("extracts 32 hex from app.notion.com URL without dash separator", () => {
    const url =
      "https://app.notion.com/p/WORKSPACETestimmopilot35273b7e41a180159729fc704295d908?source=copy_link";
    expect(parseNotionPageId(url)).toBe("35273b7e41a180159729fc704295d908");
  });

  it("returns empty string for unrecognised input", () => {
    expect(parseNotionPageId("not-a-valid-url")).toBe("");
  });
});

describe("formatNotionUuid", () => {
  it("formats 32 hex into UUID", () => {
    expect(formatNotionUuid("8c5298e1fcc78308a108813c64979f04")).toBe(
      "8c5298e1-fcc7-8308-a108-813c64979f04"
    );
  });
});

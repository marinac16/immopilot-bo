import { describe, it, expect } from "vitest";
import { BrandingSchema, UpdateBrandingSchema } from "@/lib/schemas/branding.schema";

describe("BrandingSchema", () => {
  it("parses a valid branding object", () => {
    const raw = {
      userId: "user-1",
      emailHeaderUrl: "https://example.com/header.png",
      emailFooterUrl: "https://example.com/footer.png",
    };
    expect(() => BrandingSchema.parse(raw)).not.toThrow();
  });

  it("rejects invalid emailHeaderUrl", () => {
    expect(() =>
      BrandingSchema.parse({ userId: "1", emailHeaderUrl: "not-a-url" })
    ).toThrow();
  });

  it("accepts null values for optional fields", () => {
    const b = BrandingSchema.parse({ userId: "1", emailHeaderUrl: null });
    expect(b.emailHeaderUrl).toBeNull();
  });
});

describe("UpdateBrandingSchema", () => {
  it("allows partial updates", () => {
    expect(() => UpdateBrandingSchema.parse({ emailHeaderUrl: "https://example.com/h.png" })).not.toThrow();
  });

  it("allows empty object", () => {
    expect(() => UpdateBrandingSchema.parse({})).not.toThrow();
  });
});

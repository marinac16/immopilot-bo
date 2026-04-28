import { describe, it, expect } from "vitest";
import { UserSchema, CreateUserSchema, UpdateUserSchema } from "@/lib/schemas/user.schema";

describe("UserSchema", () => {
  it("parses a valid user", () => {
    const raw = {
      id: "user-1",
      email: "agent@example.com",
      firstname: "Jean",
      lastname: "Dupont",
    };
    expect(() => UserSchema.parse(raw)).not.toThrow();
  });

  it("rejects invalid email", () => {
    expect(() =>
      UserSchema.parse({ id: "1", email: "not-an-email", firstname: "A", lastname: "B" })
    ).toThrow();
  });

  it("accepts optional nullable fields", () => {
    const user = UserSchema.parse({
      id: "1",
      email: "a@b.com",
      firstname: "A",
      lastname: "B",
      telegramChatId: null,
      lastSyncAt: null,
    });
    expect(user.telegramChatId).toBeNull();
  });

  it("parses status enum", () => {
    const user = UserSchema.parse({
      id: "1",
      email: "a@b.com",
      firstname: "A",
      lastname: "B",
      status: "ACTIVE",
    });
    expect(user.status).toBe("ACTIVE");
  });
});

describe("CreateUserSchema", () => {
  it("rejects missing lastname", () => {
    expect(() =>
      CreateUserSchema.parse({ email: "a@b.com" })
    ).toThrow();
  });

  it("passes with minimal valid data (email + lastname)", () => {
    expect(() =>
      CreateUserSchema.parse({ email: "a@b.com", lastname: "B" })
    ).not.toThrow();
  });

  it("passes with firstname optional", () => {
    expect(() =>
      CreateUserSchema.parse({ email: "a@b.com", lastname: "B", firstname: "A" })
    ).not.toThrow();
  });
});

describe("UpdateUserSchema", () => {
  it("allows partial updates", () => {
    expect(() => UpdateUserSchema.parse({ firstname: "Marie" })).not.toThrow();
  });

  it("allows empty object", () => {
    expect(() => UpdateUserSchema.parse({})).not.toThrow();
  });
});

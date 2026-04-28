// @vitest-environment node
import { describe, it, expect } from "vitest";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = "test-secret-at-least-32-characters-long";

describe("JWT auth flow", () => {
  const secret = new TextEncoder().encode(JWT_SECRET);

  it("creates a verifiable token", async () => {
    const token = await new SignJWT({ admin: true })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(secret);

    expect(typeof token).toBe("string");
    const { payload } = await jwtVerify(token, secret);
    expect(payload.admin).toBe(true);
  });

  it("rejects a token signed with a different secret", async () => {
    const otherSecret = new TextEncoder().encode("another-secret-32-characters-long!!");
    const token = await new SignJWT({ admin: true })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(otherSecret);

    await expect(jwtVerify(token, secret)).rejects.toThrow();
  });

  it("rejects an expired token", async () => {
    const token = await new SignJWT({ admin: true })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("0s")
      .sign(secret);

    await expect(jwtVerify(token, secret)).rejects.toThrow();
  });
});
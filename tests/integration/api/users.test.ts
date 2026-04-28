import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.API_URL = "http://localhost:4000";
  process.env.API_KEY = "test-api-key";
});

describe("users API", () => {
  it("getUsers returns a list of users", async () => {
    const { getUsers } = await import("@/lib/api/users");
    const users = await getUsers();
    expect(Array.isArray(users)).toBe(true);
    expect(users[0]).toMatchObject({ id: "1", email: "agent@test.com" });
  });

  it("getUser returns a single user by id", async () => {
    const { getUser } = await import("@/lib/api/users");
    const user = await getUser("1");
    expect(user.id).toBe("1");
    expect(user.firstname).toBe("Jean");
  });

  it("createUser returns a new user with id", async () => {
    const { createUser } = await import("@/lib/api/users");
    const user = await createUser({
      email: "new@test.com",
      firstname: "Nouveau",
      lastname: "User",
    });
    expect(user.id).toBe("new-1");
  });

  it("updateUser merges the patch", async () => {
    const { updateUser } = await import("@/lib/api/users");
    const user = await updateUser("1", { firstname: "Updated" });
    expect(user.firstname).toBe("Updated");
  });

  it("deleteUser resolves without error", async () => {
    const { deleteUser } = await import("@/lib/api/users");
    await expect(deleteUser("1")).resolves.toBeUndefined();
  });
});

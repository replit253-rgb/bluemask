import { describe, expect, it } from "vitest";
import { hashAdminPassword, isLegacyAdminPassword, verifyAdminPassword } from "@/lib/admin-auth";

describe("admin password hashing", () => {
  it("verifies the correct password against its salted hash", () => {
    const password = "secure-test-password";
    const stored = hashAdminPassword(password);

    expect(stored.algorithm).toBe("scrypt");
    expect(verifyAdminPassword(password, stored)).toBe(true);
    expect(verifyAdminPassword("wrong-password", stored)).toBe(false);
  });

  it("creates a unique salt for each password hash", () => {
    const first = hashAdminPassword("same-password");
    const second = hashAdminPassword("same-password");

    expect(first.salt).not.toBe(second.salt);
    expect(first.hash).not.toBe(second.hash);
  });

  it("accepts legacy passwords only for initial migration", () => {
    expect(isLegacyAdminPassword("  REDMOON ")).toBe(true);
    expect(isLegacyAdminPassword("not-a-password")).toBe(false);
  });
});

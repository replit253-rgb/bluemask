import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_SALT_LENGTH = 16;

export function hashAdminPassword(password: string) {
  const salt = randomBytes(SCRYPT_SALT_LENGTH);
  const hash = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
  return {
    algorithm: "scrypt",
    salt: salt.toString("hex"),
    hash: hash.toString("hex"),
  };
}

export function verifyAdminPassword(
  password: string,
  stored: { algorithm: string; salt: string; hash: string },
) {
  if (stored.algorithm !== "scrypt" || !/^[\da-f]+$/i.test(stored.salt + stored.hash)) {
    return false;
  }

  const salt = Buffer.from(stored.salt, "hex");
  const expected = Buffer.from(stored.hash, "hex");
  if (salt.length !== SCRYPT_SALT_LENGTH || expected.length !== SCRYPT_KEY_LENGTH) {
    return false;
  }

  const actual = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
  return timingSafeEqual(actual, expected);
}

export function isLegacyAdminPassword(password: string) {
  const normalized = password.trim().toLowerCase();
  return ["redmoon", "reedmoon", "bluemask", "123admin123"].includes(normalized);
}

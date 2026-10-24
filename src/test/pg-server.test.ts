import { afterEach, describe, expect, it, vi } from "vitest";

const { executeFallbackQuery } = vi.hoisted(() => ({
  executeFallbackQuery: vi.fn(),
}));

vi.mock("pg", () => ({
  default: {
    Pool: class {
      on() {}
      query() {
        return Promise.reject(
          Object.assign(new Error("connection refused"), { code: "ECONNREFUSED" }),
        );
      }
    },
  },
}));

vi.mock("@/lib/json-db-fallback", () => ({
  executeFallbackQuery,
}));

import { queryPostgres } from "@/lib/pg-server";

describe("queryPostgres JSON fallback", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    executeFallbackQuery.mockReset();
  });

  it("does not use the JSON fallback in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("JSON_DB_FALLBACK", "true");
    vi.stubEnv("DATABASE_URL", "postgres://test:test@localhost:5432/test");

    await expect(queryPostgres("SELECT * FROM products")).rejects.toThrow("connection refused");
    expect(executeFallbackQuery).not.toHaveBeenCalled();
  });

  it("requires explicit opt-in to use the fallback outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("JSON_DB_FALLBACK", "true");
    vi.stubEnv("DATABASE_URL", "postgres://test:test@localhost:5432/test");
    executeFallbackQuery.mockResolvedValue({ rows: [], rowCount: 0 });

    await expect(queryPostgres("SELECT * FROM products")).resolves.toMatchObject({
      rows: [],
      rowCount: 0,
    });
    expect(executeFallbackQuery).toHaveBeenCalledOnce();
  });
});

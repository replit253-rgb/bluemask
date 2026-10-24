import pg from "pg";
import { executeFallbackQuery } from "./json-db-fallback";

let poolInstance: pg.Pool | null = null;

export function getPgPool(): pg.Pool {
  if (!poolInstance) {
    const connectionString = process.env["DATABASE_URL"];
    if (!connectionString) {
      throw new Error("DATABASE_URL is required");
    }

    poolInstance = new pg.Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    poolInstance.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
    });
  }
  return poolInstance;
}

export async function queryPostgres(text: string, params?: unknown[]): Promise<pg.QueryResult> {
  try {
    const pool = getPgPool();
    return await pool.query(text, params);
  } catch (err: any) {
    const isConnectionError =
      err?.code === "ECONNREFUSED" ||
      err?.code === "ENOTFOUND" ||
      err?.message?.includes("timeout") ||
      err?.message?.includes("connection");
    const isLocalEnvironment =
      process.env["NODE_ENV"] === "development" || process.env["NODE_ENV"] === "test";
    const allowJsonFallback = isLocalEnvironment && process.env["JSON_DB_FALLBACK"] === "true";

    if (isConnectionError && allowJsonFallback) {
      const result = await executeFallbackQuery(text, params);
      return result as pg.QueryResult;
    }
    throw err;
  }
}

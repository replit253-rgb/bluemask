import pg from "pg";

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:EDUJUANDA12345@localhost:5432/BLUEMASK";

let poolInstance: pg.Pool | null = null;

export function getPgPool(): pg.Pool {
  if (!poolInstance) {
    poolInstance = new pg.Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
    });

    poolInstance.on("error", () => {
      // Quiet handler to avoid noisy unhandled connection warnings
    });
  }
  return poolInstance;
}

export async function queryPostgres(text: string, params?: unknown[]): Promise<pg.QueryResult> {
  const pool = getPgPool();
  try {
    const res = await pool.query(text, params);
    return res;
  } catch {
    // Return empty result set gracefully when PostgreSQL is unreachable or offline
    return {
      rows: [],
      rowCount: 0,
      command: "",
      oid: 0,
      fields: [],
    };
  }
}

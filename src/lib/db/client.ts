import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as schema from "./schema";

// Drizzle <-> Cloudflare D1 HTTP API bridge.
// We use the sqlite-proxy driver and POST queries to the D1 REST endpoint
// so the same client works from Vercel (no Workers binding needed).

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const DATABASE_ID = process.env.CLOUDFLARE_D1_DATABASE_ID;
const D1_TOKEN = process.env.CLOUDFLARE_D1_TOKEN;

type D1HttpResponse = {
  success: boolean;
  errors?: Array<{ message: string }>;
  result?: Array<{
    results?: unknown[];
    meta?: Record<string, unknown>;
    success?: boolean;
  }>;
};

async function callD1(sql: string, params: unknown[]): Promise<unknown[]> {
  if (!ACCOUNT_ID || !DATABASE_ID || !D1_TOKEN) {
    throw new Error(
      "D1 not configured. Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_D1_TOKEN in env.",
    );
  }
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${D1_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, params }),
    cache: "no-store",
  });
  const json = (await res.json()) as D1HttpResponse;
  if (!res.ok || !json.success) {
    const msg = json.errors?.map((e) => e.message).join("; ") ?? res.statusText;
    throw new Error(`D1 query failed: ${msg}`);
  }
  return json.result?.[0]?.results ?? [];
}

function rowsToArrays(rows: unknown[]): unknown[][] {
  return rows.map((row) => {
    if (Array.isArray(row)) return row;
    if (row && typeof row === "object") return Object.values(row);
    return [row];
  });
}

export const db = drizzle(
  async (sql, params, method) => {
    const results = await callD1(sql, params);
    const rows = rowsToArrays(results);
    return { rows: method === "get" ? rows[0] ?? [] : rows };
  },
  { schema, casing: "snake_case" },
);

export { schema };

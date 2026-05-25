#!/usr/bin/env bun
// Apply Drizzle-generated SQL migrations to Cloudflare D1 via the HTTP API.
// Idempotent: tracks applied migration filenames in a `_migrations` table so
// re-running only applies what's new.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const DATABASE_ID = process.env.CLOUDFLARE_D1_DATABASE_ID;
const D1_TOKEN = process.env.CLOUDFLARE_D1_TOKEN;

if (!ACCOUNT_ID || !DATABASE_ID || !D1_TOKEN) {
  console.error(
    "Missing Cloudflare env. Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_D1_TOKEN in .env.local",
  );
  process.exit(1);
}

const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;

type D1Response = {
  success: boolean;
  errors?: Array<{ message: string }>;
  result?: Array<{ results?: Array<Record<string, unknown>> }>;
};

async function query(sql: string, params: unknown[] = []) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${D1_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, params }),
  });
  const json = (await res.json()) as D1Response;
  if (!res.ok || !json.success) {
    throw new Error(json.errors?.map((e) => e.message).join("; ") ?? res.statusText);
  }
  return json.result?.[0]?.results ?? [];
}

await query(
  "CREATE TABLE IF NOT EXISTS _migrations (filename TEXT PRIMARY KEY, applied_at INTEGER NOT NULL DEFAULT (unixepoch()))",
);

const appliedRows = (await query("SELECT filename FROM _migrations")) as Array<{
  filename: string;
}>;
const applied = new Set(appliedRows.map((r) => r.filename));

const migrationsDir = join(import.meta.dirname, "..", "drizzle");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

let count = 0;
for (const file of files) {
  if (applied.has(file)) {
    console.log(`✓ skipped ${file} (already applied)`);
    continue;
  }
  console.log(`→ applying ${file}`);
  const sql = readFileSync(join(migrationsDir, file), "utf8");
  const statements = sql
    .split(/-->\s*statement-breakpoint/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const stmt of statements) {
    await query(stmt);
  }
  await query("INSERT INTO _migrations (filename) VALUES (?)", [file]);
  count++;
}

console.log(count > 0 ? `✓ applied ${count} migration(s)` : "✓ schema up-to-date");

#!/usr/bin/env bun
// Force-reset the admin password to whatever's in ADMIN_PASSWORD env.
// Useful if you forgot the admin password or want to update it from env.
// If the admin user doesn't exist yet, this creates it (same as db:seed).

import bcrypt from "bcryptjs";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const DATABASE_ID = process.env.CLOUDFLARE_D1_DATABASE_ID;
const D1_TOKEN = process.env.CLOUDFLARE_D1_TOKEN;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME ?? "Admin";

if (!ACCOUNT_ID || !DATABASE_ID || !D1_TOKEN) {
  console.error("Missing Cloudflare env vars.");
  process.exit(1);
}
if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
  console.error("Set ADMIN_USERNAME and ADMIN_PASSWORD in .env.local.");
  process.exit(1);
}

const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;

async function query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${D1_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, params }),
  });
  const json = (await res.json()) as {
    success: boolean;
    errors?: Array<{ message: string }>;
    result?: Array<{ results?: T[] }>;
  };
  if (!res.ok || !json.success) {
    throw new Error(json.errors?.map((e) => e.message).join("; ") ?? res.statusText);
  }
  return json.result?.[0]?.results ?? [];
}

const username = ADMIN_USERNAME.toLowerCase();
const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
const now = Math.floor(Date.now() / 1000);

const existing = await query<{ id: string }>(
  "SELECT id FROM users WHERE username = ?",
  [username],
);

if (existing[0]) {
  await query(
    "UPDATE users SET password_hash = ?, name = ?, role = 'admin', is_active = 1, updated_at = ? WHERE username = ?",
    [hash, ADMIN_NAME, now, username],
  );
  console.log(`✓ reset password for admin "${username}"`);
} else {
  const id = "u_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  await query(
    "INSERT INTO users (id, username, name, password_hash, role, is_active) VALUES (?, ?, ?, ?, 'admin', 1)",
    [id, username, ADMIN_NAME, hash],
  );
  console.log(`✓ created admin "${username}"`);
}

console.log(`→ login at /login with username "${username}" + ADMIN_PASSWORD`);

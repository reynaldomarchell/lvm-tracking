import { defineConfig } from "drizzle-kit";

// drizzle-kit is spawned as a child process; `bun --env-file=...` doesn't always
// propagate, so load .env.local explicitly here.
try {
  process.loadEnvFile(".env.local");
} catch {
  // file optional in CI
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "d1-http",
  casing: "snake_case",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
});

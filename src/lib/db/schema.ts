import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const USER_ROLES = ["admin", "staff"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").$type<UserRole>().notNull().default("staff"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdBy: text("created_by"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const MERCHANT_STATUS = [
  "lead",
  "livin_waiting",
  "livin_percepatan",
  "merchant_active",
  "delivered",
] as const;

export type MerchantStatus = (typeof MERCHANT_STATUS)[number];

export const BUSINESS_TYPES = [
  "warung",
  "umkm",
  "restoran",
  "kafe",
  "toko",
  "jasa",
  "online",
  "lainnya",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const VISIT_ACTIONS = [
  "survei",
  "daftar_livin",
  "daftar_merchant",
  "antar_kartu",
  "antar_qris",
  "follow_up",
] as const;

export type VisitAction = (typeof VISIT_ACTIONS)[number];

export const merchants = sqliteTable("merchants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  ownerName: text("owner_name"),
  businessType: text("business_type").$type<BusinessType>(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  lat: real("lat"),
  lng: real("lng"),
  status: text("status").$type<MerchantStatus>().notNull().default("lead"),
  // AI-extracted insights (latest snapshot, also kept per-visit)
  painPoints: text("pain_points", { mode: "json" }).$type<string[]>(),
  currentBank: text("current_bank", { mode: "json" }).$type<string[]>(),
  currentMerchantApp: text("current_merchant_app", { mode: "json" }).$type<string[]>(),
  customerNeeds: text("customer_needs", { mode: "json" }).$type<string[]>(),
  referrals: text("referrals", { mode: "json" }).$type<
    Array<{ name: string; note?: string }>
  >(),
  // Pipeline timestamps
  livinRegisteredAt: integer("livin_registered_at", { mode: "timestamp" }),
  percepatan: integer("percepatan", { mode: "boolean" }).default(false),
  merchantActiveAt: integer("merchant_active_at", { mode: "timestamp" }),
  deliveryRequestedAt: integer("delivery_requested_at", { mode: "timestamp" }),
  deliveredAt: integer("delivered_at", { mode: "timestamp" }),
  // Audit
  createdBy: text("created_by"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const visits = sqliteTable("visits", {
  id: text("id").primaryKey(),
  merchantId: text("merchant_id")
    .notNull()
    .references(() => merchants.id, { onDelete: "cascade" }),
  visitedAt: integer("visited_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  visitedBy: text("visited_by"),
  action: text("action").$type<VisitAction>(),
  notes: text("notes").notNull(),
  voiceTranscript: text("voice_transcript"),
  // AI extraction snapshot for THIS visit
  extracted: text("extracted", { mode: "json" }).$type<{
    pain_points?: string[];
    current_bank?: string[];
    current_merchant_app?: string[];
    customer_needs?: string[];
    referrals?: Array<{ name: string; note?: string }>;
    summary?: string;
  }>(),
});

export type Merchant = typeof merchants.$inferSelect;
export type NewMerchant = typeof merchants.$inferInsert;
export type Visit = typeof visits.$inferSelect;
export type NewVisit = typeof visits.$inferInsert;

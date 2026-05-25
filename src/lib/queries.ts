import "server-only";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { merchants, visits, type Merchant, type MerchantStatus } from "@/lib/db/schema";

export async function listMerchants(opts?: {
  status?: MerchantStatus;
  search?: string;
}): Promise<Merchant[]> {
  const where = [] as ReturnType<typeof eq>[];
  if (opts?.status) where.push(eq(merchants.status, opts.status));
  let rows: Merchant[];
  if (opts?.search) {
    const like = `%${opts.search.toLowerCase()}%`;
    rows = await db
      .select()
      .from(merchants)
      .where(
        and(
          ...where,
          sql`(lower(${merchants.name}) like ${like} or lower(coalesce(${merchants.ownerName}, '')) like ${like} or lower(coalesce(${merchants.address}, '')) like ${like})`,
        ),
      )
      .orderBy(desc(merchants.updatedAt));
  } else {
    rows = await db
      .select()
      .from(merchants)
      .where(where.length ? and(...where) : undefined)
      .orderBy(desc(merchants.updatedAt));
  }
  return rows;
}

export async function getMerchant(id: string) {
  const rows = await db
    .select()
    .from(merchants)
    .where(eq(merchants.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function listVisits(merchantId: string) {
  return db
    .select()
    .from(visits)
    .where(eq(visits.merchantId, merchantId))
    .orderBy(desc(visits.visitedAt));
}

export async function countByStatus() {
  const rows = await db
    .select({
      status: merchants.status,
      count: sql<number>`cast(count(*) as integer)`,
    })
    .from(merchants)
    .groupBy(merchants.status);
  return rows;
}

export async function visitsToday(by?: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const where = [
    gte(visits.visitedAt, start),
    lte(visits.visitedAt, end),
  ] as ReturnType<typeof eq>[];
  if (by) where.push(eq(visits.visitedBy, by));
  return db
    .select()
    .from(visits)
    .where(and(...where))
    .orderBy(desc(visits.visitedAt));
}

export async function merchantsRegisteredToday(by?: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const where = [
    gte(merchants.merchantActiveAt, start),
    lte(merchants.merchantActiveAt, end),
  ] as ReturnType<typeof eq>[];
  if (by) where.push(eq(merchants.createdBy, by));
  return db
    .select()
    .from(merchants)
    .where(and(...where));
}

export async function followUps(): Promise<Merchant[]> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() - 1);
  // Anyone who registered Livin' yesterday-or-earlier and is still waiting, OR
  // percepatan that's still waiting, OR merchant active without delivery yet.
  const rows = await db
    .select()
    .from(merchants)
    .where(
      sql`(${merchants.status} = 'livin_waiting' and ${merchants.livinRegisteredAt} <= ${Math.floor(tomorrow.getTime() / 1000)})
          or ${merchants.status} = 'livin_percepatan'
          or (${merchants.status} = 'merchant_active' and ${merchants.deliveryRequestedAt} is not null)`,
    )
    .orderBy(desc(merchants.updatedAt));
  return rows;
}

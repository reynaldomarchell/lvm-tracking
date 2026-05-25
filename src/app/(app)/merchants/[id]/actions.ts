"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { merchants, MERCHANT_STATUS, type MerchantStatus } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth";

const StatusSchema = z.enum(MERCHANT_STATUS);

export async function updateStatusAction(
  merchantId: string,
  rawStatus: string,
  opts?: { percepatan?: boolean },
) {
  await requireSession();
  const status = StatusSchema.parse(rawStatus);
  const now = new Date();

  const patch: Partial<typeof merchants.$inferInsert> = {
    status,
    updatedAt: now,
  };

  if (status === "livin_waiting" || status === "livin_percepatan") {
    patch.livinRegisteredAt = now;
    patch.percepatan = status === "livin_percepatan" || !!opts?.percepatan;
  }
  if (status === "merchant_active") {
    patch.merchantActiveAt = now;
  }
  if (status === "delivered") {
    patch.deliveredAt = now;
  }

  await db.update(merchants).set(patch).where(eq(merchants.id, merchantId));
  revalidatePath(`/merchants/${merchantId}`);
  revalidatePath("/dashboard");
  revalidatePath("/daftar");
  revalidatePath("/peta");
}

export async function requestDeliveryAction(merchantId: string) {
  await requireSession();
  await db
    .update(merchants)
    .set({ deliveryRequestedAt: new Date(), updatedAt: new Date() })
    .where(eq(merchants.id, merchantId));
  revalidatePath(`/merchants/${merchantId}`);
  revalidatePath("/dashboard");
}

export async function setStatus(
  merchantId: string,
  status: MerchantStatus,
) {
  return updateStatusAction(merchantId, status);
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import {
  BUSINESS_TYPES,
  MERCHANT_STATUS,
  merchants,
} from "@/lib/db/schema";
import { requireSession } from "@/lib/auth";

const StatusSchema = z.enum(MERCHANT_STATUS);

const EditSchema = z.object({
  name: z.string().min(1, "Nama merchant wajib diisi"),
  ownerName: z.string().optional(),
  businessType: z.enum(BUSINESS_TYPES).optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
});

export type EditMerchantState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function editMerchantAction(
  merchantId: string,
  _prev: EditMerchantState,
  formData: FormData,
): Promise<EditMerchantState> {
  await requireSession();

  const raw = {
    name: String(formData.get("name") ?? "").trim(),
    ownerName: String(formData.get("ownerName") ?? "").trim() || undefined,
    businessType:
      (String(formData.get("businessType") ?? "").trim() || undefined) as
        | undefined
        | (typeof BUSINESS_TYPES)[number],
    phone: String(formData.get("phone") ?? "").trim() || undefined,
    email: String(formData.get("email") ?? "").trim() || undefined,
    address: String(formData.get("address") ?? "").trim() || undefined,
    lat: formData.get("lat") || undefined,
    lng: formData.get("lng") || undefined,
  };

  const parsed = EditSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return { error: "Periksa kembali isian.", fieldErrors };
  }

  await db
    .update(merchants)
    .set({
      name: parsed.data.name,
      ownerName: parsed.data.ownerName ?? null,
      businessType: parsed.data.businessType ?? null,
      phone: parsed.data.phone ?? null,
      email: parsed.data.email ?? null,
      address: parsed.data.address ?? null,
      lat: parsed.data.lat ?? null,
      lng: parsed.data.lng ?? null,
      updatedAt: new Date(),
    })
    .where(eq(merchants.id, merchantId));

  revalidatePath(`/merchants/${merchantId}`);
  revalidatePath("/dashboard");
  revalidatePath("/daftar");
  revalidatePath("/peta");
  redirect(`/merchants/${merchantId}`);
}

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
  if (status === "delivery_pending") {
    patch.deliveryRequestedAt = now;
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
  const now = new Date();
  await db
    .update(merchants)
    .set({
      status: "delivery_pending",
      deliveryRequestedAt: now,
      updatedAt: now,
    })
    .where(eq(merchants.id, merchantId));
  revalidatePath(`/merchants/${merchantId}`);
  revalidatePath("/dashboard");
  revalidatePath("/daftar");
  revalidatePath("/peta");
}

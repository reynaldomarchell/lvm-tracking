"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { merchants, BUSINESS_TYPES } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth";

const Schema = z.object({
  name: z.string().min(1, "Nama merchant wajib diisi"),
  ownerName: z.string().optional(),
  businessType: z.enum(BUSINESS_TYPES).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
});

export type AddMerchantState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function generateId() {
  return "m_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

export async function createMerchantAction(
  _prev: AddMerchantState,
  formData: FormData,
): Promise<AddMerchantState> {
  const session = await requireSession();

  const raw = {
    name: String(formData.get("name") ?? "").trim(),
    ownerName: String(formData.get("ownerName") ?? "").trim() || undefined,
    businessType:
      (String(formData.get("businessType") ?? "").trim() || undefined) as
        | undefined
        | (typeof BUSINESS_TYPES)[number],
    phone: String(formData.get("phone") ?? "").trim() || undefined,
    address: String(formData.get("address") ?? "").trim() || undefined,
    lat: formData.get("lat") || undefined,
    lng: formData.get("lng") || undefined,
  };

  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return { error: "Periksa kembali isian.", fieldErrors };
  }

  const id = generateId();
  const now = new Date();
  await db.insert(merchants).values({
    id,
    name: parsed.data.name,
    ownerName: parsed.data.ownerName,
    businessType: parsed.data.businessType,
    phone: parsed.data.phone,
    address: parsed.data.address,
    lat: parsed.data.lat,
    lng: parsed.data.lng,
    status: "lead",
    createdBy: session.name,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/dashboard");
  revalidatePath("/daftar");
  revalidatePath("/peta");
  redirect(`/merchants/${id}/kunjungan?new=1`);
}

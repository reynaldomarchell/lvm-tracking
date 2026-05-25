"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import {
  merchants,
  visits,
  VISIT_ACTIONS,
  type VisitAction,
} from "@/lib/db/schema";
import { requireSession } from "@/lib/auth";
import { extractInsights, type ExtractedInsights } from "@/lib/gemini";

const ExtractedSchema = z.object({
  pain_points: z.array(z.string()).default([]),
  current_bank: z.array(z.string()).default([]),
  current_merchant_app: z.array(z.string()).default([]),
  customer_needs: z.array(z.string()).default([]),
  referrals: z
    .array(z.object({ name: z.string(), note: z.string().optional() }))
    .default([]),
  summary: z.string().default(""),
});

export async function extractAction(notes: string): Promise<ExtractedInsights> {
  await requireSession();
  return extractInsights(notes);
}

function uniqueMerge(a: string[] | null, b: string[]): string[] {
  return Array.from(new Set([...(a ?? []), ...b])).filter(Boolean);
}

function mergeReferrals(
  a: Array<{ name: string; note?: string }> | null,
  b: Array<{ name: string; note?: string }>,
): Array<{ name: string; note?: string }> {
  const seen = new Set<string>();
  const out: Array<{ name: string; note?: string }> = [];
  for (const ref of [...(a ?? []), ...b]) {
    const key = ref.name.toLowerCase().trim();
    if (key && !seen.has(key)) {
      seen.add(key);
      out.push(ref);
    }
  }
  return out;
}

const SaveSchema = z.object({
  merchantId: z.string(),
  action: z.enum(VISIT_ACTIONS).optional(),
  notes: z.string().min(1, "Catatan tidak boleh kosong."),
  voiceTranscript: z.string().optional(),
  extracted: ExtractedSchema,
});

export type SaveVisitState = {
  error?: string;
};

export async function saveVisitAction(
  _prev: SaveVisitState,
  formData: FormData,
): Promise<SaveVisitState> {
  const session = await requireSession();

  const raw = {
    merchantId: String(formData.get("merchantId") ?? ""),
    action: (String(formData.get("action") ?? "").trim() || undefined) as
      | VisitAction
      | undefined,
    notes: String(formData.get("notes") ?? "").trim(),
    voiceTranscript:
      String(formData.get("voiceTranscript") ?? "").trim() || undefined,
    extracted: JSON.parse(
      String(formData.get("extracted") ?? "{}"),
    ) as ExtractedInsights,
  };

  const parsed = SaveSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Form tidak valid." };
  }

  const merchant = (
    await db
      .select()
      .from(merchants)
      .where(eq(merchants.id, parsed.data.merchantId))
      .limit(1)
  )[0];
  if (!merchant) return { error: "Merchant tidak ditemukan." };

  const now = new Date();

  // Insert visit
  await db.insert(visits).values({
    id: "v_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16),
    merchantId: parsed.data.merchantId,
    visitedAt: now,
    visitedBy: session.name,
    action: parsed.data.action,
    notes: parsed.data.notes,
    voiceTranscript: parsed.data.voiceTranscript,
    extracted: parsed.data.extracted,
  });

  // Merge insights into the merchant snapshot
  const ext = parsed.data.extracted;
  const merchantPatch: Partial<typeof merchants.$inferInsert> = {
    painPoints: uniqueMerge(merchant.painPoints, ext.pain_points),
    currentBank: uniqueMerge(merchant.currentBank, ext.current_bank),
    currentMerchantApp: uniqueMerge(
      merchant.currentMerchantApp,
      ext.current_merchant_app,
    ),
    customerNeeds: uniqueMerge(merchant.customerNeeds, ext.customer_needs),
    referrals: mergeReferrals(merchant.referrals, ext.referrals),
    updatedAt: now,
  };

  // Pipeline transitions driven by chosen action
  switch (parsed.data.action) {
    case "daftar_livin":
      if (merchant.status === "lead") {
        merchantPatch.status = "livin_waiting";
        merchantPatch.livinRegisteredAt = now;
      }
      break;
    case "daftar_merchant":
      merchantPatch.status = "merchant_active";
      merchantPatch.merchantActiveAt = now;
      break;
    case "antar_kartu":
    case "antar_qris":
      merchantPatch.status = "delivered";
      merchantPatch.deliveredAt = now;
      break;
  }

  await db
    .update(merchants)
    .set(merchantPatch)
    .where(eq(merchants.id, parsed.data.merchantId));

  revalidatePath(`/merchants/${parsed.data.merchantId}`);
  revalidatePath("/dashboard");
  revalidatePath("/daftar");
  revalidatePath("/peta");
  redirect(`/merchants/${parsed.data.merchantId}`);
}

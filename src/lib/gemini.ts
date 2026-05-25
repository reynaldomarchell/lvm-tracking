import "server-only";
import { GoogleGenAI, Type } from "@google/genai";

export type ExtractedInsights = {
  pain_points: string[];
  current_bank: string[];
  current_merchant_app: string[];
  customer_needs: string[];
  referrals: Array<{ name: string; note?: string }>;
  summary: string;
};

const EMPTY: ExtractedInsights = {
  pain_points: [],
  current_bank: [],
  current_merchant_app: [],
  customer_needs: [],
  referrals: [],
  summary: "",
};

const responseSchema = {
  type: Type.OBJECT,
  required: [
    "pain_points",
    "current_bank",
    "current_merchant_app",
    "customer_needs",
    "referrals",
    "summary",
  ],
  properties: {
    pain_points: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Keluhan / hambatan customer terhadap layanan perbankan atau merchant yang sekarang dipakai. Bahasa Indonesia.",
    },
    current_bank: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Bank atau dompet digital lain yang sedang dipakai (contoh: BCA, BRI, GoPay, Dana).",
    },
    current_merchant_app: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Layanan merchant / QRIS / EDC yang sedang dipakai (contoh: QRIS BCA, GoBiz, Dana Bisnis).",
    },
    customer_needs: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Hal yang customer butuhkan / pertimbangkan saat memilih bank atau merchant (biaya, fitur, kecepatan settlement, dll).",
    },
    referrals: {
      type: Type.ARRAY,
      description:
        "Merchant / toko lain yang customer rekomendasikan untuk didekati (yang belum pakai Livin' Merchant / QRIS Mandiri).",
      items: {
        type: Type.OBJECT,
        required: ["name"],
        properties: {
          name: { type: Type.STRING },
          note: { type: Type.STRING },
        },
      },
    },
    summary: {
      type: Type.STRING,
      description:
        "Ringkasan 1 kalimat dalam Bahasa Indonesia tentang kunjungan ini.",
    },
  },
} as const;

const SYSTEM = `Kamu adalah asisten untuk tim BranchX Bank Mandiri KC Pulogadung yang sedang melakukan akuisisi Livin' & Livin' Merchant.
Dari catatan kunjungan ke calon merchant (Bahasa Indonesia, gaya bicara santai/sales-lapangan), ekstrak informasi penting ke struktur JSON yang sudah ditentukan.
Aturan:
- Jangan mengarang. Kalau tidak disebut, kembalikan array kosong.
- Pakai Bahasa Indonesia singkat dan padat.
- Pisahkan setiap poin sebagai item array tersendiri.
- Untuk "referrals", masukkan nama merchant lain yang user/customer rekomendasikan, lengkap dengan catatan singkat kalau ada (lokasi, jenis usaha, kenapa cocok).
- "summary" wajib diisi: 1 kalimat ringkas yang menggambarkan inti kunjungan.`;

export async function extractInsights(
  notes: string,
): Promise<ExtractedInsights> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not set; skipping extraction.");
    return EMPTY;
  }
  if (!notes.trim()) return EMPTY;

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: notes,
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.2,
      },
    });
    const text = response.text;
    if (!text) return EMPTY;
    const parsed = JSON.parse(text) as Partial<ExtractedInsights>;
    return {
      pain_points: parsed.pain_points ?? [],
      current_bank: parsed.current_bank ?? [],
      current_merchant_app: parsed.current_merchant_app ?? [],
      customer_needs: parsed.customer_needs ?? [],
      referrals: parsed.referrals ?? [],
      summary: parsed.summary ?? "",
    };
  } catch (err) {
    console.error("Gemini extraction failed:", err);
    return EMPTY;
  }
}

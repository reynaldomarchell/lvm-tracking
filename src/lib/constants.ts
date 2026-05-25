import type { BusinessType, MerchantStatus, VisitAction } from "@/lib/db/schema";

export const DAILY_TARGET = 10;

export const STATUS_LABEL: Record<MerchantStatus, string> = {
  lead: "Lead",
  livin_waiting: "Livin' aktif · tunggu 1 hari",
  livin_percepatan: "Livin' aktif · percepatan",
  merchant_active: "Merchant aktif",
  delivery_pending: "Minta antar kartu/QRIS",
  delivered: "Selesai (kartu/QRIS diantar)",
};

export const STATUS_SHORT: Record<MerchantStatus, string> = {
  lead: "Lead",
  livin_waiting: "Tunggu H+1",
  livin_percepatan: "Percepatan",
  merchant_active: "Merchant aktif",
  delivery_pending: "Minta antar",
  delivered: "Selesai",
};

export const STATUS_COLOR: Record<MerchantStatus, string> = {
  lead: "bg-slate-100 text-slate-700 border-slate-200",
  livin_waiting: "bg-amber-100 text-amber-800 border-amber-200",
  livin_percepatan: "bg-violet-100 text-violet-800 border-violet-200",
  merchant_active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  delivery_pending: "bg-orange-100 text-orange-800 border-orange-200",
  delivered: "bg-sky-100 text-sky-800 border-sky-200",
};

export const STATUS_PIN_COLOR: Record<MerchantStatus, string> = {
  lead: "#64748b",
  livin_waiting: "#d97706",
  livin_percepatan: "#7c3aed",
  merchant_active: "#059669",
  delivery_pending: "#ea580c",
  delivered: "#0ea5e9",
};

export const STATUS_ORDER: MerchantStatus[] = [
  "lead",
  "livin_waiting",
  "livin_percepatan",
  "merchant_active",
  "delivery_pending",
  "delivered",
];

export const BUSINESS_TYPE_LABEL: Record<BusinessType, string> = {
  warung: "Warung",
  umkm: "UMKM",
  restoran: "Restoran",
  kafe: "Kafe",
  toko: "Toko",
  jasa: "Jasa",
  online: "Online",
  lainnya: "Lainnya",
};

export const VISIT_ACTION_LABEL: Record<VisitAction, string> = {
  survei: "Survei / Perkenalan",
  daftar_livin: "Daftar Livin'",
  daftar_merchant: "Daftar Livin' Merchant",
  antar_kartu: "Antar kartu debit",
  antar_qris: "Antar QRIS",
  follow_up: "Follow-up",
};

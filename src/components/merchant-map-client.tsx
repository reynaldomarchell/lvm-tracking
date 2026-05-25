"use client";

import dynamic from "next/dynamic";
import type { Merchant } from "@/lib/db/schema";

const MerchantMap = dynamic(
  () => import("./merchant-map").then((m) => m.MerchantMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-slate-100 text-sm text-slate-500">
        Memuat peta…
      </div>
    ),
  },
);

export function MerchantMapClient({ merchants }: { merchants: Merchant[] }) {
  return <MerchantMap merchants={merchants} />;
}

"use client";

import dynamic from "next/dynamic";

export const LocationPickerClient = dynamic(
  () => import("./location-picker").then((m) => m.LocationPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-[280px] w-full rounded-lg bg-slate-100 flex items-center justify-center text-sm text-slate-500">
        Memuat peta…
      </div>
    ),
  },
);

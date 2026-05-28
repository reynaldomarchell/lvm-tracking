"use client";

import { ResponsiveSheet } from "@/components/responsive-sheet";
import { AddMerchantForm } from "@/app/(app)/tambah/add-merchant-form";

export function AddMerchantDialog({ exitTo = "/daftar" }: { exitTo?: string }) {
  function close() {
    // Hard nav to force the parallel-route @modal slot to release its cache.
    window.location.href = exitTo;
  }
  return (
    <ResponsiveSheet
      open
      title="Tambah Merchant"
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <div className="px-4 pt-6 pb-10 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tambah Merchant</h2>
          <p className="text-sm text-slate-600 mt-1">
            Catat merchant baru yang kamu temui di lapangan. Setelah disimpan,
            lanjut isi catatan kunjungan.
          </p>
        </div>
        <AddMerchantForm />
      </div>
    </ResponsiveSheet>
  );
}

"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddMerchantForm } from "@/app/(app)/tambah/add-merchant-form";

export function AddMerchantDialog({ exitTo = "/daftar" }: { exitTo?: string }) {
  const router = useRouter();
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) router.push(exitTo);
      }}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl bg-slate-50">
        <DialogHeader>
          <DialogTitle>Tambah Merchant</DialogTitle>
          <DialogDescription>
            Catat merchant baru yang kamu temui di lapangan. Setelah disimpan,
            lanjut isi catatan kunjungan.
          </DialogDescription>
        </DialogHeader>
        <AddMerchantForm />
      </DialogContent>
    </Dialog>
  );
}

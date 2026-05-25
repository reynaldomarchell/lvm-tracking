"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateStatusAction } from "@/app/(app)/merchants/[id]/actions";
import { MERCHANT_STATUS, type MerchantStatus } from "@/lib/db/schema";
import { STATUS_LABEL } from "@/lib/constants";

export function StatusActions({
  merchantId,
  status,
}: {
  merchantId: string;
  status: MerchantStatus;
}) {
  const [pending, start] = useTransition();

  function changeStatus(next: MerchantStatus) {
    if (next === status) return;
    start(async () => {
      try {
        await updateStatusAction(merchantId, next);
        toast.success("Status diperbarui.");
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Gagal memperbarui status.",
        );
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide inline-flex items-center gap-1.5">
          <Pencil className="size-3.5" />
          Ubah tahap pipeline
        </p>
        {pending && <Loader2 className="size-3.5 animate-spin text-slate-400" />}
      </div>
      <Select
        value={status}
        onValueChange={(v) => changeStatus(v as MerchantStatus)}
        disabled={pending}
      >
        <SelectTrigger className="h-11 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MERCHANT_STATUS.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-[11px] text-slate-400 leading-relaxed">
        Pilih tahap berikutnya untuk maju, atau pilih tahap sebelumnya untuk
        koreksi. Update langsung tersimpan.
      </p>
    </div>
  );
}

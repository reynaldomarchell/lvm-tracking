import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MerchantStatus } from "@/lib/db/schema";

const STEPS: Array<{ key: MerchantStatus; label: string }> = [
  { key: "lead", label: "Lead" },
  { key: "livin_waiting", label: "Livin'" },
  { key: "merchant_active", label: "Merchant" },
  { key: "delivery_pending", label: "Antar" },
  { key: "delivered", label: "Selesai" },
];

const STATUS_INDEX: Record<MerchantStatus, number> = {
  lead: 0,
  livin_waiting: 1,
  livin_percepatan: 1,
  merchant_active: 2,
  delivery_pending: 3,
  delivered: 4,
};

export function StatusStepper({ status }: { status: MerchantStatus }) {
  const currentIndex = STATUS_INDEX[status];

  return (
    <div className="flex items-center justify-between">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div
            key={step.key}
            className="flex-1 flex flex-col items-center text-center"
          >
            <div className="flex items-center w-full">
              <div
                className={cn(
                  "h-1 flex-1",
                  i === 0
                    ? "bg-transparent"
                    : i <= currentIndex
                      ? "bg-blue-500"
                      : "bg-slate-200",
                )}
              />
              <div
                className={cn(
                  "size-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0",
                  done && "bg-blue-500 text-white",
                  active && "bg-blue-600 text-white ring-4 ring-blue-100",
                  !done && !active && "bg-slate-100 text-slate-400",
                )}
              >
                {done ? <Check className="size-4" /> : i + 1}
              </div>
              <div
                className={cn(
                  "h-1 flex-1",
                  i === STEPS.length - 1
                    ? "bg-transparent"
                    : i < currentIndex
                      ? "bg-blue-500"
                      : "bg-slate-200",
                )}
              />
            </div>
            <p
              className={cn(
                "mt-1.5 text-[10px] font-medium leading-tight",
                done || active ? "text-slate-700" : "text-slate-400",
              )}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

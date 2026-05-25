"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  PackageCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateStatusAction, requestDeliveryAction } from "@/app/(app)/merchants/[id]/actions";
import type { MerchantStatus } from "@/lib/db/schema";

function nextActions(
  status: MerchantStatus,
): Array<{
  to: MerchantStatus | "request_delivery";
  label: string;
  icon: typeof ArrowRight;
  tone?: "default" | "outline";
}> {
  switch (status) {
    case "lead":
      return [
        {
          to: "livin_waiting",
          label: "Daftar Livin' (tunggu H+1)",
          icon: Clock,
        },
        {
          to: "livin_percepatan",
          label: "Daftar Livin' + Percepatan",
          icon: Zap,
        },
      ];
    case "livin_waiting":
    case "livin_percepatan":
      return [
        {
          to: "merchant_active",
          label: "Livin' Merchant aktif",
          icon: CheckCircle2,
        },
      ];
    case "merchant_active":
      return [
        {
          to: "request_delivery",
          label: "Minta antar kartu/QRIS",
          icon: PackageCheck,
          tone: "outline",
        },
        {
          to: "delivered",
          label: "Tandai selesai (kartu diantar)",
          icon: CheckCircle2,
        },
      ];
    default:
      return [];
  }
}

export function StatusActions({
  merchantId,
  status,
}: {
  merchantId: string;
  status: MerchantStatus;
}) {
  const [pending, start] = useTransition();
  const actions = nextActions(status);
  if (actions.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        Lanjutkan ke tahap
      </p>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.to}
            disabled={pending}
            variant={action.tone ?? "default"}
            className={
              action.tone === "outline"
                ? "w-full h-11 justify-start"
                : "w-full h-11 justify-start bg-blue-600 hover:bg-blue-700"
            }
            onClick={() =>
              start(async () => {
                try {
                  if (action.to === "request_delivery") {
                    await requestDeliveryAction(merchantId);
                    toast.success("Permintaan antar kartu dicatat.");
                  } else {
                    await updateStatusAction(merchantId, action.to);
                    toast.success("Status diperbarui.");
                  }
                } catch (e) {
                  toast.error(
                    e instanceof Error ? e.message : "Gagal memperbarui status.",
                  );
                }
              })
            }
          >
            <Icon className="size-4" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}

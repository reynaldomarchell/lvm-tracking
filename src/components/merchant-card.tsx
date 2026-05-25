import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STATUS_COLOR, STATUS_SHORT, BUSINESS_TYPE_LABEL } from "@/lib/constants";
import type { Merchant } from "@/lib/db/schema";

export function MerchantCard({ merchant }: { merchant: Merchant }) {
  return (
    <Link href={`/merchants/${merchant.id}`} className="block">
      <Card className="hover:border-blue-300 active:bg-slate-50 transition">
        <CardContent className="py-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900 truncate">
                {merchant.name}
              </p>
              {merchant.ownerName && (
                <p className="text-xs text-slate-500 truncate">
                  Pemilik: {merchant.ownerName}
                </p>
              )}
            </div>
            <Badge
              className={`${STATUS_COLOR[merchant.status]} border text-[10px] shrink-0`}
              variant="outline"
            >
              {STATUS_SHORT[merchant.status]}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            {merchant.businessType && (
              <span className="font-medium text-slate-600">
                {BUSINESS_TYPE_LABEL[merchant.businessType]}
              </span>
            )}
            {merchant.address && (
              <span className="inline-flex items-center gap-1 truncate max-w-[200px]">
                <MapPin className="size-3 shrink-0" />
                {merchant.address}
              </span>
            )}
            {merchant.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="size-3" />
                {merchant.phone}
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-400">
            Diperbarui{" "}
            {formatDistanceToNow(merchant.updatedAt, {
              addSuffix: true,
              locale: idLocale,
            })}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

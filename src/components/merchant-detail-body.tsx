import Link from "next/link";
import {
  Building2,
  Map,
  MapPin,
  MessageSquarePlus,
  Pencil,
  Phone,
  Share2,
  Sparkles,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusStepper } from "@/components/status-stepper";
import { StatusActions } from "@/components/status-actions";
import { VisitDeleteButton } from "@/components/visit-delete-button";
import {
  BUSINESS_TYPE_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
  VISIT_ACTION_LABEL,
} from "@/lib/constants";
import type { Merchant, Visit } from "@/lib/db/schema";

function withFrom(href: string, from?: string) {
  if (!from) return href;
  const sep = href.includes("?") ? "&" : "?";
  return `${href}${sep}from=${encodeURIComponent(from)}`;
}

export function MerchantDetailBody({
  merchant,
  visits,
  from,
}: {
  merchant: Merchant;
  visits: Visit[];
  from?: string;
}) {
  const insights = {
    pain_points: merchant.painPoints ?? [],
    current_bank: merchant.currentBank ?? [],
    current_merchant_app: merchant.currentMerchantApp ?? [],
    customer_needs: merchant.customerNeeds ?? [],
    referrals: merchant.referrals ?? [],
  };
  const hasInsights =
    insights.pain_points.length +
      insights.current_bank.length +
      insights.current_merchant_app.length +
      insights.customer_needs.length +
      insights.referrals.length >
    0;

  return (
    <div className="space-y-5">
      {/* Header card */}
      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {merchant.name}
              </h2>
              {merchant.ownerName && (
                <p className="text-sm text-slate-600 mt-0.5">
                  Pemilik: {merchant.ownerName}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Badge
                className={`${STATUS_COLOR[merchant.status]} border`}
                variant="outline"
              >
                {STATUS_LABEL[merchant.status]}
              </Badge>
              <Button
                asChild
                variant="ghost"
                size="icon-sm"
                aria-label="Edit merchant"
              >
                <Link
                  href={withFrom(`/merchants/${merchant.id}/edit`, from)}
                >
                  <Pencil className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-1.5 text-sm">
            {merchant.businessType && (
              <p className="flex items-center gap-2 text-slate-700">
                <Building2 className="size-4 text-slate-400" />
                {BUSINESS_TYPE_LABEL[merchant.businessType]}
              </p>
            )}
            {merchant.phone && (
              <a
                href={`tel:${merchant.phone}`}
                className="flex items-center gap-2 text-blue-700 active:text-blue-900"
              >
                <Phone className="size-4" />
                {merchant.phone}
              </a>
            )}
            {merchant.address && (
              <p className="flex items-start gap-2 text-slate-700">
                <MapPin className="size-4 mt-0.5 text-slate-400 shrink-0" />
                <span>{merchant.address}</span>
              </p>
            )}
            {merchant.lat != null && merchant.lng != null && (
              <a
                href={`https://www.google.com/maps?q=${merchant.lat},${merchant.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-700 active:text-blue-900"
              >
                <Map className="size-4" />
                <span className="text-sm font-medium">Buka di Google Maps</span>
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {hasInsights && (
        <Card className="overflow-hidden border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50/60 to-white shadow-sm">
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
                <Sparkles className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-slate-900 leading-tight">
                  Insight Pelanggan
                </p>
                <p className="text-[11px] text-slate-500">
                  Diekstrak otomatis dari catatan kunjungan
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {insights.pain_points.length > 0 && (
                <InsightRow label="Pain points" items={insights.pain_points} />
              )}
              {insights.current_bank.length > 0 && (
                <InsightRow
                  label="Bank yang dipakai"
                  items={insights.current_bank}
                />
              )}
              {insights.current_merchant_app.length > 0 && (
                <InsightRow
                  label="Merchant app saat ini"
                  items={insights.current_merchant_app}
                />
              )}
              {insights.customer_needs.length > 0 && (
                <InsightRow
                  label="Kebutuhan / pertimbangan"
                  items={insights.customer_needs}
                />
              )}
            </div>

            {insights.referrals.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-md bg-amber-500 text-white flex items-center justify-center">
                    <Share2 className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-900 leading-tight">
                      Referral merchant lain
                    </p>
                    <p className="text-[10px] text-amber-700/80">
                      Lead baru yang direkomendasikan customer
                    </p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {insights.referrals.map((r, i) => (
                    <li
                      key={i}
                      className="bg-white/70 border border-amber-100 rounded-md px-2.5 py-1.5"
                    >
                      <p className="text-sm font-medium text-slate-900 leading-tight">
                        {r.name}
                      </p>
                      {r.note && (
                        <p className="text-xs text-slate-600 mt-0.5">{r.note}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pipeline stepper */}
      <Card>
        <CardContent className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Progress akuisisi
          </p>
          <StatusStepper status={merchant.status} />
          {merchant.percepatan && (
            <p className="flex items-center gap-1 text-xs text-violet-700 bg-violet-50 px-2 py-1 rounded-md w-fit">
              <Zap className="size-3" /> Percepatan diaktifkan
            </p>
          )}
          {merchant.livinRegisteredAt && (
            <p className="text-xs text-slate-500">
              Livin&apos; aktif sejak{" "}
              {format(merchant.livinRegisteredAt, "d MMM yyyy, HH:mm", {
                locale: idLocale,
              })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Status actions */}
      <Card>
        <CardContent>
          <StatusActions merchantId={merchant.id} status={merchant.status} />
        </CardContent>
      </Card>

      {/* Add visit CTA */}
      <Button asChild className="w-full h-12 bg-blue-600 hover:bg-blue-700">
        <Link
          href={withFrom(`/merchants/${merchant.id}/kunjungan`, from)}
        >
          <MessageSquarePlus className="size-5" />
          Catat kunjungan baru
        </Link>
      </Button>

      {/* Visits timeline */}
      <section>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">
          Riwayat kunjungan ({visits.length})
        </h3>
        {visits.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-slate-500">
              Belum ada catatan kunjungan.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {visits.map((v) => (
              <Card key={v.id}>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-slate-600 min-w-0 truncate">
                      {v.visitedBy ?? "Tim"} ·{" "}
                      {format(v.visitedAt, "d MMM, HH:mm", {
                        locale: idLocale,
                      })}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {v.action && (
                        <Badge variant="outline" className="text-[10px]">
                          {VISIT_ACTION_LABEL[v.action]}
                        </Badge>
                      )}
                      <VisitDeleteButton visitId={v.id} />
                    </div>
                  </div>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap">
                    {v.notes}
                  </p>
                  {v.extracted?.summary && (
                    <p className="text-xs text-blue-700 bg-blue-50 rounded-md px-2 py-1 flex gap-1">
                      <Sparkles className="size-3 shrink-0 mt-0.5" />
                      {v.extracted.summary}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InsightRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-600 mb-1">{label}</p>
      <div className="flex flex-wrap gap-1">
        {items.map((item, i) => (
          <Badge
            key={i}
            variant="outline"
            className="bg-white text-xs font-normal"
          >
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

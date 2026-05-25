import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  MapPin,
  MessageSquarePlus,
  Phone,
  Sparkles,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { PageContainer } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusStepper } from "@/components/status-stepper";
import { StatusActions } from "@/components/status-actions";
import { getMerchant, listVisits } from "@/lib/queries";
import {
  BUSINESS_TYPE_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
  VISIT_ACTION_LABEL,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function MerchantDetailPage({ params }: Props) {
  const { id } = await params;
  const merchant = await getMerchant(id);
  if (!merchant) notFound();
  const visits = await listVisits(id);

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
    <PageContainer title={merchant.name}>
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
              <Badge
                className={`${STATUS_COLOR[merchant.status]} border shrink-0`}
                variant="outline"
              >
                {STATUS_LABEL[merchant.status]}
              </Badge>
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
                  className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 underline"
                >
                  Buka di Google Maps
                </a>
              )}
            </div>
          </CardContent>
        </Card>

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
        <StatusActions merchantId={merchant.id} status={merchant.status} />

        {/* AI Insights */}
        {hasInsights && (
          <Card className="border-blue-100 bg-blue-50/40">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-blue-600" />
                <p className="text-sm font-semibold text-blue-800">
                  Insight pelanggan (dari catatan)
                </p>
              </div>
              {insights.pain_points.length > 0 && (
                <InsightRow
                  label="Pain points"
                  items={insights.pain_points}
                />
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
              {insights.referrals.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-1">
                    Referral merchant lain
                  </p>
                  <ul className="space-y-1">
                    {insights.referrals.map((r, i) => (
                      <li key={i} className="text-sm text-slate-700">
                        • {r.name}
                        {r.note ? ` — ${r.note}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add visit CTA */}
        <Button
          asChild
          className="w-full h-12 bg-blue-600 hover:bg-blue-700"
        >
          <Link href={`/merchants/${merchant.id}/kunjungan`}>
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
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600">
                        {v.visitedBy ?? "Tim"} ·{" "}
                        {format(v.visitedAt, "d MMM, HH:mm", {
                          locale: idLocale,
                        })}
                      </span>
                      {v.action && (
                        <Badge variant="outline" className="text-[10px]">
                          {VISIT_ACTION_LABEL[v.action]}
                        </Badge>
                      )}
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
    </PageContainer>
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

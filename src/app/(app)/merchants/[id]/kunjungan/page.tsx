import { notFound } from "next/navigation";
import { PageContainer } from "@/components/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VisitForm } from "./visit-form";
import { getMerchant } from "@/lib/queries";
import { STATUS_COLOR, STATUS_SHORT } from "@/lib/constants";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
};

export default async function VisitPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { new: isNew } = await searchParams;
  const merchant = await getMerchant(id);
  if (!merchant) notFound();

  return (
    <PageContainer title="Catat Kunjungan">
      <div className="space-y-4">
        {isNew && (
          <p className="text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-md p-2 text-center">
            ✓ Merchant tersimpan. Sekarang catat hasil kunjungannya.
          </p>
        )}

        <Card>
          <CardContent className="flex items-center justify-between gap-2 py-3">
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 truncate">
                {merchant.name}
              </p>
              {merchant.address && (
                <p className="text-xs text-slate-500 truncate">
                  {merchant.address}
                </p>
              )}
            </div>
            <Badge
              variant="outline"
              className={`${STATUS_COLOR[merchant.status]} border text-[10px] shrink-0`}
            >
              {STATUS_SHORT[merchant.status]}
            </Badge>
          </CardContent>
        </Card>

        <VisitForm merchantId={merchant.id} />
      </div>
    </PageContainer>
  );
}

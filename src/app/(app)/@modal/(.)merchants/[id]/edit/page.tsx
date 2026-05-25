import { notFound } from "next/navigation";
import { MerchantDetailSheet } from "@/components/merchant-detail-sheet";
import { EditMerchantForm } from "@/app/(app)/merchants/[id]/edit/edit-merchant-form";
import { getMerchant } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
};

export default async function InterceptedEditPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { from } = await searchParams;
  const merchant = await getMerchant(id);
  if (!merchant) notFound();

  const exitTo = from || "/daftar";
  const backHref = from
    ? `/merchants/${id}?from=${encodeURIComponent(from)}`
    : `/merchants/${id}`;

  return (
    <MerchantDetailSheet
      title={`Edit — ${merchant.name}`}
      exitTo={exitTo}
      backHref={backHref}
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Ubah info merchant. Pipeline status &amp; riwayat kunjungan tidak
          terpengaruh.
        </p>
        <EditMerchantForm merchant={merchant} />
      </div>
    </MerchantDetailSheet>
  );
}

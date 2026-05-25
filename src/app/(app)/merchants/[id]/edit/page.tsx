import { notFound } from "next/navigation";
import { PageContainer } from "@/components/app-header";
import { getMerchant } from "@/lib/queries";
import { EditMerchantForm } from "./edit-merchant-form";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditMerchantPage({ params }: Props) {
  const { id } = await params;
  const merchant = await getMerchant(id);
  if (!merchant) notFound();

  return (
    <PageContainer title="Edit Merchant">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Ubah info merchant {merchant.name}. Pipeline status &amp; riwayat
          kunjungan tidak terpengaruh.
        </p>
        <EditMerchantForm merchant={merchant} />
      </div>
    </PageContainer>
  );
}

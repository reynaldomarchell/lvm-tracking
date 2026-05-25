import { notFound } from "next/navigation";
import { PageContainer } from "@/components/app-header";
import { MerchantDetailBody } from "@/components/merchant-detail-body";
import { getMerchant, listVisits } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function MerchantDetailPage({ params }: Props) {
  const { id } = await params;
  const merchant = await getMerchant(id);
  if (!merchant) notFound();
  const visits = await listVisits(id);

  return (
    <PageContainer title={merchant.name} backHref="/daftar">
      <MerchantDetailBody merchant={merchant} visits={visits} />
    </PageContainer>
  );
}

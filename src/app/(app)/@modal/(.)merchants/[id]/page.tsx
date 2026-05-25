import { notFound } from "next/navigation";
import { MerchantDetailSheet } from "@/components/merchant-detail-sheet";
import { MerchantDetailBody } from "@/components/merchant-detail-body";
import { getMerchant, listVisits } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
};

export default async function InterceptedMerchantDetailPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { from } = await searchParams;
  const merchant = await getMerchant(id);
  if (!merchant) notFound();
  const visits = await listVisits(id);

  const exitTo = from || "/daftar";

  return (
    <MerchantDetailSheet title={merchant.name} exitTo={exitTo}>
      <MerchantDetailBody merchant={merchant} visits={visits} from={from} />
    </MerchantDetailSheet>
  );
}

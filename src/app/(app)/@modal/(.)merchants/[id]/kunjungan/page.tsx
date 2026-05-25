import { notFound } from "next/navigation";
import { MerchantDetailSheet } from "@/components/merchant-detail-sheet";
import { KunjunganBody } from "@/app/(app)/merchants/[id]/kunjungan/kunjungan-body";
import { getMerchant } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string; from?: string }>;
};

export default async function InterceptedKunjunganPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { new: isNew, from } = await searchParams;
  const merchant = await getMerchant(id);
  if (!merchant) notFound();

  const exitTo = from || "/daftar";
  const backHref = from
    ? `/merchants/${id}?from=${encodeURIComponent(from)}`
    : `/merchants/${id}`;

  return (
    <MerchantDetailSheet
      title={`Catat kunjungan — ${merchant.name}`}
      exitTo={exitTo}
      backHref={backHref}
    >
      <KunjunganBody merchant={merchant} isNew={isNew === "1"} />
    </MerchantDetailSheet>
  );
}

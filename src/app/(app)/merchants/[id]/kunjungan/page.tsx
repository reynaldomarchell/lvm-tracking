import { notFound } from "next/navigation";
import { PageContainer } from "@/components/app-header";
import { KunjunganBody } from "./kunjungan-body";
import { getMerchant } from "@/lib/queries";

export const dynamic = "force-dynamic";

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
    <PageContainer title="Catat Kunjungan" backHref={`/merchants/${id}`}>
      <KunjunganBody merchant={merchant} isNew={isNew === "1"} />
    </PageContainer>
  );
}

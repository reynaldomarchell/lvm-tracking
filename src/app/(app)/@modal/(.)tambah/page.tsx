import { AddMerchantDialog } from "@/components/add-merchant-dialog";

type Props = { searchParams: Promise<{ from?: string }> };

export default async function InterceptedTambahPage({ searchParams }: Props) {
  const { from } = await searchParams;
  return <AddMerchantDialog exitTo={from || "/daftar"} />;
}

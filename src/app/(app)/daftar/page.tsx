import { Suspense } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { PageContainer } from "@/components/app-header";
import { MerchantCard } from "@/components/merchant-card";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listMerchants } from "@/lib/queries";
import { STATUS_COLOR, STATUS_ORDER, STATUS_SHORT } from "@/lib/constants";
import { MERCHANT_STATUS, type MerchantStatus } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ status?: string; q?: string }>;
};

function isStatus(v: string | undefined): v is MerchantStatus {
  return !!v && (MERCHANT_STATUS as readonly string[]).includes(v);
}

export default async function DaftarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = isStatus(params.status) ? params.status : undefined;
  const search = params.q?.trim() || undefined;
  const merchants = await listMerchants({ status, search });

  return (
    <PageContainer title="Daftar Merchant">
      <div className="space-y-4">
        <form className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            name="q"
            defaultValue={search ?? ""}
            placeholder="Cari nama, pemilik, alamat…"
            className="pl-9 h-11"
          />
          {status && <input type="hidden" name="status" value={status} />}
        </form>

        <div className="-mx-4 px-4 overflow-x-auto">
          <div className="flex gap-2 pb-1 w-max">
            <Link href="/daftar">
              <Badge
                variant="outline"
                className={`${!status ? "bg-blue-600 text-white border-blue-600" : "bg-white"} h-8 px-3 text-xs cursor-pointer`}
              >
                Semua
              </Badge>
            </Link>
            {STATUS_ORDER.map((s) => (
              <Link key={s} href={`/daftar?status=${s}`}>
                <Badge
                  variant="outline"
                  className={`${status === s ? "bg-blue-600 text-white border-blue-600" : STATUS_COLOR[s]} h-8 px-3 text-xs cursor-pointer`}
                >
                  {STATUS_SHORT[s]}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        <Suspense fallback={null}>
          {merchants.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center space-y-3">
                <p className="text-sm text-slate-500">
                  {search || status
                    ? "Tidak ada merchant yang cocok."
                    : "Belum ada merchant. Tambahkan yang pertama!"}
                </p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/tambah">
                    <Plus className="size-4" />
                    Tambah merchant
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {merchants.map((m) => (
                <MerchantCard key={m.id} merchant={m} />
              ))}
            </div>
          )}
        </Suspense>
      </div>
    </PageContainer>
  );
}

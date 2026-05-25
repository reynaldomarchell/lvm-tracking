import Link from "next/link";
import { ChevronRight, Plus, Users } from "lucide-react";
import { PageContainer } from "@/components/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import {
  countByStatus,
  followUps,
  merchantsRegisteredToday,
  visitsToday,
} from "@/lib/queries";
import {
  DAILY_TARGET,
  STATUS_COLOR,
  STATUS_ORDER,
  STATUS_SHORT,
} from "@/lib/constants";
import type { MerchantStatus } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  const [registered, visits, statusCounts, follows] = await Promise.all([
    merchantsRegisteredToday(),
    visitsToday(),
    countByStatus(),
    followUps(),
  ]);

  const registeredCount = registered.length;
  const progressPct = Math.min(
    100,
    Math.round((registeredCount / DAILY_TARGET) * 100),
  );

  const countByStatusMap = Object.fromEntries(
    statusCounts.map((r) => [r.status, r.count]),
  ) as Record<MerchantStatus, number>;

  return (
    <PageContainer title="Beranda">
      <div className="space-y-5">
        {/* Greeting */}
        <div>
          <p className="text-sm text-slate-500">Selamat datang,</p>
          <h2 className="text-xl font-bold text-slate-900">
            {session?.name ?? "Tim BranchX"} 👋
          </h2>
        </div>

        {/* Daily target card */}
        <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-blue-700/80 uppercase tracking-wide">
                  Target hari ini
                </p>
                <p className="mt-1 text-3xl font-bold text-blue-700">
                  {registeredCount}
                  <span className="text-base font-medium text-blue-700/60">
                    {" "}
                    / {DAILY_TARGET}
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Livin&apos; Merchant aktif hari ini
                </p>
              </div>
              <Users className="size-6 text-blue-600" />
            </div>
            <Progress value={progressPct} className="h-2 bg-blue-100" />
            <p className="text-xs text-blue-700/80">
              {DAILY_TARGET - registeredCount > 0
                ? `Kurang ${DAILY_TARGET - registeredCount} merchant lagi 🚀`
                : "Target tercapai! 🎉"}
            </p>
          </CardContent>
        </Card>

        {/* Activity row */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="py-4">
              <p className="text-xs text-slate-500">Kunjungan hari ini</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {visits.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-xs text-slate-500">Total merchant</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {Object.values(countByStatusMap).reduce((a, b) => a + b, 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline */}
        <section>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">
            Pipeline akuisisi
          </h3>
          <Card>
            <CardContent className="divide-y">
              {STATUS_ORDER.map((status) => (
                <Link
                  key={status}
                  href={`/daftar?status=${status}`}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0 active:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      className={`${STATUS_COLOR[status]} border font-medium`}
                      variant="outline"
                    >
                      {STATUS_SHORT[status]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-base font-semibold text-slate-900">
                      {countByStatusMap[status] ?? 0}
                    </span>
                    <ChevronRight className="size-4 text-slate-400" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Follow-up list */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-700">
              Perlu di-follow up
            </h3>
            <span className="text-xs text-slate-400">
              {follows.length} merchant
            </span>
          </div>
          {follows.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-sm text-slate-500">
                Belum ada yang perlu di-follow up. 🎯
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {follows.slice(0, 5).map((m) => (
                <Link
                  key={m.id}
                  href={`/merchants/${m.id}?from=${encodeURIComponent("/dashboard")}`}
                  className="block"
                >
                  <Card className="hover:border-blue-300 transition">
                    <CardContent className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-slate-900 truncate">
                          {m.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {m.address ?? "Lokasi belum dicatat"}
                        </p>
                      </div>
                      <Badge
                        className={`${STATUS_COLOR[m.status]} border text-[10px]`}
                        variant="outline"
                      >
                        {STATUS_SHORT[m.status]}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Big CTA */}
        <Button
          asChild
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold"
        >
          <Link href="/tambah">
            <Plus className="size-5" />
            Tambah merchant baru
          </Link>
        </Button>
      </div>
    </PageContainer>
  );
}

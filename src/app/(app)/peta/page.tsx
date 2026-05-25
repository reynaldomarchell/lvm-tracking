import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { MerchantMapClient } from "@/components/merchant-map-client";
import { listMerchants } from "@/lib/queries";
import {
  STATUS_ORDER,
  STATUS_PIN_COLOR,
  STATUS_SHORT,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function PetaPage() {
  const merchants = await listMerchants();
  const withCoords = merchants.filter((m) => m.lat != null && m.lng != null);

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader title="Peta Merchant" />
      <div className="relative flex-1">
        <div className="absolute inset-0">
          <MerchantMapClient merchants={merchants} />
        </div>
        {/* Legend — anchored bottom-left to avoid Leaflet's top-left zoom controls and the floating + button */}
        <div className="absolute bottom-24 left-2 right-2 z-[800] pointer-events-none flex justify-center">
          <div className="bg-white/95 shadow-lg rounded-full px-3 py-1.5 text-[11px] flex flex-wrap gap-x-3 gap-y-1 items-center pointer-events-auto max-w-full">
            {STATUS_ORDER.map((s) => (
              <span key={s} className="inline-flex items-center gap-1">
                <span
                  className="inline-block size-2 rounded-full"
                  style={{ background: STATUS_PIN_COLOR[s] }}
                />
                <span className="text-slate-600">{STATUS_SHORT[s]}</span>
              </span>
            ))}
          </div>
        </div>
        {withCoords.length === 0 && merchants.length > 0 && (
          <div className="absolute inset-x-4 top-4 z-[800] bg-white shadow-lg rounded-md p-4 text-center pointer-events-auto">
            <Badge variant="outline" className="mb-1">
              Belum ada lokasi
            </Badge>
            <p className="text-sm text-slate-600">
              Tambahkan merchant dengan koordinat (tap &quot;Pakai lokasi
              sekarang&quot; saat menambah) supaya muncul di peta.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

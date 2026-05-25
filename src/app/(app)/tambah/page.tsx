import { PageContainer } from "@/components/app-header";
import { AddMerchantForm } from "./add-merchant-form";

export default function TambahPage() {
  return (
    <PageContainer title="Tambah Merchant">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Catat merchant baru yang kamu temui di lapangan. Setelah disimpan,
          lanjut isi catatan kunjungan — AI akan ekstrak insight pelanggan
          otomatis.
        </p>
        <AddMerchantForm />
      </div>
    </PageContainer>
  );
}

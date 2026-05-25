"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Loader2,
  MapPin,
  Phone,
  Save,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LocationPickerClient } from "@/components/location-picker-client";
import { editMerchantAction, type EditMerchantState } from "../actions";
import { BUSINESS_TYPE_LABEL } from "@/lib/constants";
import { BUSINESS_TYPES, type Merchant } from "@/lib/db/schema";

const initialState: EditMerchantState = {};

export function EditMerchantForm({ merchant }: { merchant: Merchant }) {
  const action = editMerchantAction.bind(null, merchant.id);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({
    lat: merchant.lat ?? undefined,
    lng: merchant.lng ?? undefined,
  });

  return (
    <form action={formAction} className="space-y-4">
      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="flex items-center gap-1.5">
              <Building2 className="size-3.5" />
              Nama merchant / toko
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={merchant.name}
              className="h-11"
            />
            {state.fieldErrors?.name && (
              <p className="text-xs text-red-500">{state.fieldErrors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ownerName" className="flex items-center gap-1.5">
              <User className="size-3.5" />
              Nama pemilik
            </Label>
            <Input
              id="ownerName"
              name="ownerName"
              defaultValue={merchant.ownerName ?? ""}
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="businessType">Jenis usaha</Label>
            <Select
              name="businessType"
              defaultValue={merchant.businessType ?? undefined}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Pilih jenis usaha" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {BUSINESS_TYPE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="flex items-center gap-1.5">
              <Phone className="size-3.5" />
              Nomor HP
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              defaultValue={merchant.phone ?? ""}
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={merchant.email ?? ""}
              className="h-11"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <Label className="flex items-center gap-1.5">
            <MapPin className="size-3.5" />
            Lokasi
          </Label>
          <LocationPickerClient
            value={coords}
            onChange={(c) => setCoords(c)}
          />
          <Input
            id="address"
            name="address"
            defaultValue={merchant.address ?? ""}
            placeholder="Alamat / patokan (opsional)"
            className="h-11"
          />
          <input type="hidden" name="lat" value={coords.lat ?? ""} />
          <input type="hidden" name="lng" value={coords.lng ?? ""} />
        </CardContent>
      </Card>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-2 text-center">
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <Button
          asChild
          variant="outline"
          disabled={pending}
          className="flex-1 h-12"
        >
          <Link href={`/merchants/${merchant.id}`}>
            <X className="size-4" />
            Batal
          </Link>
        </Button>
        <Button
          type="submit"
          disabled={pending}
          className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {pending ? "Menyimpan…" : "Simpan perubahan"}
        </Button>
      </div>
    </form>
  );
}

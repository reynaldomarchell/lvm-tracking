"use client";

import { useActionState, useState } from "react";
import {
  Building2,
  Loader2,
  MapPin,
  Phone,
  Save,
  User,
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
import { createMerchantAction, type AddMerchantState } from "./actions";
import { BUSINESS_TYPE_LABEL } from "@/lib/constants";
import { BUSINESS_TYPES } from "@/lib/db/schema";

const initialState: AddMerchantState = {};

export function AddMerchantForm() {
  const [state, formAction, pending] = useActionState(
    createMerchantAction,
    initialState,
  );
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});

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
              placeholder="cth. Warung Kopi Bu Tini"
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
              placeholder="cth. Ibu Tini"
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="businessType">Jenis usaha</Label>
            <Select name="businessType">
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
              placeholder="cth. 0812xxxxxxx"
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
            placeholder="Alamat / patokan (opsional)"
            className="h-11"
          />
          <input type="hidden" name="lat" value={coords.lat ?? ""} />
          <input type="hidden" name="lng" value={coords.lng ?? ""} />
          <p className="text-xs text-slate-400">
            Tap peta untuk pilih titik lokasi merchant, atau pakai GPS kamu.
          </p>
        </CardContent>
      </Card>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-2 text-center">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        {pending ? "Menyimpan…" : "Simpan & lanjut catat kunjungan"}
      </Button>
    </form>
  );
}

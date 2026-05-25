"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { ArrowRight, Crosshair, Map as MapIcon } from "lucide-react";
import { HiOutlineLocationMarker } from "react-icons/hi";
import "leaflet/dist/leaflet.css";
import {
  STATUS_COLOR,
  STATUS_PIN_COLOR,
  STATUS_SHORT,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import type { Merchant } from "@/lib/db/schema";

// Jakarta center — covers DKI Jakarta area at default zoom.
const JAKARTA_CENTER: [number, number] = [-6.2088, 106.8456];
const JAKARTA_ZOOM = 11;

function pinIcon(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 42" width="30" height="42">
      <path d="M15 0C6.7 0 0 6.6 0 14.7 0 25.7 15 42 15 42s15-16.3 15-27.3C30 6.6 23.3 0 15 0z" fill="${color}"/>
      <circle cx="15" cy="15" r="6" fill="white"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "lvm-pin",
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -36],
  });
}

function LocateButton() {
  const map = useMap();
  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control leaflet-bar !border-0 !shadow-none">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="!size-10 shadow-md"
          onClick={() => {
            if (!navigator.geolocation) return;
            navigator.geolocation.getCurrentPosition((pos) => {
              map.flyTo([pos.coords.latitude, pos.coords.longitude], 16);
            });
          }}
          aria-label="Lokasi saya"
        >
          <Crosshair className="size-5" />
        </Button>
      </div>
    </div>
  );
}

export function MerchantMap({ merchants }: { merchants: Merchant[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const withCoords = merchants.filter(
    (m): m is Merchant & { lat: number; lng: number } =>
      m.lat != null && m.lng != null,
  );

  return (
    <MapContainer
      center={JAKARTA_CENTER}
      zoom={JAKARTA_ZOOM}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocateButton />
      {withCoords.map((m) => (
        <Marker
          key={m.id}
          position={[m.lat, m.lng]}
          icon={pinIcon(STATUS_PIN_COLOR[m.status])}
        >
          <Popup className="lvm-popup">
            <div className="min-w-[220px] space-y-2.5">
              <div className="flex items-start gap-2">
                <div
                  className="mt-1 size-2.5 rounded-full shrink-0"
                  style={{ background: STATUS_PIN_COLOR[m.status] }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 leading-tight !mt-0 !mb-0">
                    {m.name}
                  </p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_COLOR[m.status]}`}
                  >
                    {STATUS_SHORT[m.status]}
                  </span>
                </div>
              </div>
              {m.address && (
                <p className="text-xs text-slate-600 leading-snug !my-0 flex items-start gap-1">
                  <HiOutlineLocationMarker className="size-3.5 shrink-0 text-slate-400 mt-0.5" />
                  <span>{m.address}</span>
                </p>
              )}
              <div className="flex gap-1.5 pt-1">
                <Link
                  href={`/merchants/${m.id}`}
                  className="!no-underline !text-white flex-1 inline-flex items-center justify-center gap-1 h-8 px-3 rounded-md bg-blue-600 hover:bg-blue-700 text-xs font-semibold transition"
                  style={{ color: "#fff" }}
                >
                  Detail
                  <ArrowRight className="size-3" />
                </Link>
                <a
                  href={`https://www.google.com/maps?q=${m.lat},${m.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="!no-underline !text-slate-700 inline-flex items-center justify-center gap-1 h-8 px-3 rounded-md border border-slate-200 hover:bg-slate-50 text-xs font-semibold transition"
                  style={{ color: "#334155" }}
                  aria-label="Buka di Google Maps"
                >
                  <MapIcon className="size-3" />
                  Maps
                </a>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

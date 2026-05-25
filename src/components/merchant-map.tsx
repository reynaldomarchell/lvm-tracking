"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { Crosshair } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { STATUS_PIN_COLOR } from "@/lib/constants";
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
  const router = useRouter();
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
          eventHandlers={{
            click: () =>
              router.push(
                `/merchants/${m.id}?from=${encodeURIComponent("/peta")}`,
              ),
          }}
        />
      ))}
    </MapContainer>
  );
}

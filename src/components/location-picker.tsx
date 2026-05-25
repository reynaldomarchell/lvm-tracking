"use client";

import { useEffect, useRef, useState } from "react";
import { Crosshair, MapPin } from "lucide-react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";

const DEFAULT_CENTER: [number, number] = [-6.1893, 106.9027]; // Pulogadung

function pinIcon() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 42" width="30" height="42">
      <path d="M15 0C6.7 0 0 6.6 0 14.7 0 25.7 15 42 15 42s15-16.3 15-27.3C30 6.6 23.3 0 15 0z" fill="#2644ea"/>
      <circle cx="15" cy="15" r="6" fill="white"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "lvm-pin-pick",
    iconSize: [30, 42],
    iconAnchor: [15, 42],
  });
}

function ClickToPlace({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyTo({ position }: { position: [number, number] | null }) {
  const map = useMap();
  const last = useRef<string>("");
  useEffect(() => {
    if (!position) return;
    const key = position.join(",");
    if (key === last.current) return;
    last.current = key;
    map.flyTo(position, Math.max(map.getZoom(), 16));
  }, [position, map]);
  return null;
}

export function LocationPicker({
  value,
  onChange,
}: {
  value: { lat?: number; lng?: number };
  onChange: (next: { lat: number; lng: number }) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [locating, setLocating] = useState(false);
  useEffect(() => setMounted(true), []);

  const position: [number, number] | null =
    value.lat != null && value.lng != null ? [value.lat, value.lng] : null;

  if (!mounted) {
    return (
      <div className="h-[280px] w-full rounded-lg bg-slate-100 flex items-center justify-center text-sm text-slate-500">
        Memuat peta…
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative h-[280px] w-full overflow-hidden rounded-lg border">
        <MapContainer
          center={position ?? DEFAULT_CENTER}
          zoom={position ? 16 : 13}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToPlace
            onPick={(lat, lng) => onChange({ lat, lng })}
          />
          <FlyTo position={position} />
          {position && (
            <Marker
              position={position}
              icon={pinIcon()}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const ll = e.target.getLatLng();
                  onChange({ lat: ll.lat, lng: ll.lng });
                },
              }}
            />
          )}
        </MapContainer>

        {!position && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="bg-white/95 shadow-md rounded-full px-3 py-1.5 text-xs text-slate-600 flex items-center gap-1.5">
              <MapPin className="size-3.5 text-blue-600" />
              Tap di peta untuk memilih lokasi
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={locating}
          onClick={() => {
            if (!navigator.geolocation) {
              toast.error("Browser tidak mendukung geolocation.");
              return;
            }
            setLocating(true);
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                onChange({
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                });
                setLocating(false);
              },
              (err) => {
                toast.error(`Gagal mendapatkan lokasi: ${err.message}`);
                setLocating(false);
              },
              { enableHighAccuracy: true, timeout: 10000 },
            );
          }}
        >
          <Crosshair className="size-3.5" />
          Pakai lokasi saya
        </Button>

        {position ? (
          <span className="text-[11px] font-medium text-blue-700">
            ✓ {position[0].toFixed(5)}, {position[1].toFixed(5)}
          </span>
        ) : (
          <span className="text-[11px] text-slate-400">
            Belum ada koordinat
          </span>
        )}
      </div>
    </div>
  );
}

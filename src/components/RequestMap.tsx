"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ── Icons ─────────────────────────────────────────────────────────────────

delete (L.Icon.Default.prototype as any)._getIconUrl;

const userIcon = L.divIcon({
  html: `
    <div style="position:relative;width:22px;height:22px">
      <div style="position:absolute;inset:0;background:rgba(249,115,22,0.25);border-radius:50%;animation:ping 1.5s ease-in-out infinite"></div>
      <div style="position:absolute;inset:3px;background:#f97316;border:2px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(249,115,22,0.6)"></div>
    </div>`,
  className: "",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -14],
});

const buildMechanicIcon = (isLive: boolean) =>
  L.divIcon({
    html: `
      <div style="position:relative;width:24px;height:24px">
        ${isLive ? `<div style="position:absolute;inset:-4px;background:rgba(34,197,94,0.25);border-radius:50%;animation:ping 1.2s ease-in-out infinite"></div>` : ""}
        <div style="position:absolute;inset:0;background:${isLive ? "#22c55e" : "#3b82f6"};border:2.5px solid white;border-radius:50%;box-shadow:0 2px 10px rgba(34,197,94,0.5);display:flex;align-items:center;justify-content:center;font-size:10px">🔧</div>
      </div>`,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -16],
  });

const buildMechanicListIcon = (selected: boolean) =>
  L.divIcon({
    html: `<div style="width:16px;height:16px;background:${selected ? "#22c55e" : "#3b82f6"};border:2.5px solid white;border-radius:50%;box-shadow:0 0 0 3px rgba(59,130,246,0.3)"></div>`,
    className: "",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

// ── Haversine ─────────────────────────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Ping animation injected once ──────────────────────────────────────────

if (typeof window !== "undefined" && !document.getElementById("__wm_ping_style")) {
  const style = document.createElement("style");
  style.id = "__wm_ping_style";
  style.textContent = `
    @keyframes ping {
      0%, 100% { transform: scale(1); opacity: 0.7; }
      50%       { transform: scale(1.8); opacity: 0; }
    }`;
  document.head.appendChild(style);
}

// ── Types ─────────────────────────────────────────────────────────────────

interface Props {
  lat: number;
  lng: number;
  mechanics?: any[];
  selectedId?: string;
  onSelect?: (m: any) => void;
  /** Mechanic's real-time lat — set to animate the mechanic marker */
  mechanicLat?: number;
  mechanicLng?: number;
  /** When true the mechanic marker shows the live-pulsing green ring */
  isLive?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function RequestMap({
  lat,
  lng,
  mechanics = [],
  selectedId,
  onSelect,
  mechanicLat,
  mechanicLng,
  isLive = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const userMarkerRef    = useRef<L.Marker | null>(null);
  const mechMarkerRef    = useRef<L.Marker | null>(null);
  const polylineRef      = useRef<L.Polyline | null>(null);
  const etaTooltipRef    = useRef<L.Tooltip | null>(null);

  // ── Init map once ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat || 12.9716, lng || 77.5946],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── User marker (static) ───────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !lat || !lng) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([lat, lng]);
    } else {
      userMarkerRef.current = L.marker([lat, lng], { icon: userIcon })
        .addTo(map)
        .bindPopup("<b>📍 Your Location</b>");
    }
  }, [lat, lng]);

  // ── Mechanic list markers (for request form) ───────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || mechanics.length === 0) return;

    const markers: L.Marker[] = [];
    mechanics.forEach((m) => {
      if (!m.lat || !m.lng) return;
      const marker = L.marker([m.lat, m.lng], { icon: buildMechanicListIcon(m.id === selectedId) })
        .addTo(map)
        .bindPopup(
          `<b>🔧 ${m.user?.name}</b><br>${m.specializations}<br><small>${m.distance?.toFixed(1)} km away</small>`
        );
      if (onSelect) marker.on("click", () => onSelect(m));
      markers.push(marker);
    });

    return () => markers.forEach((m) => m.remove());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mechanics, selectedId]);

  // ── Live mechanic marker + polyline + ETA ─────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mechanicLat || !mechanicLng) return;

    const mLatLng: L.LatLngExpression = [mechanicLat, mechanicLng];
    const uLatLng: L.LatLngExpression = [lat, lng];

    // Animate existing marker or create a new one
    if (mechMarkerRef.current) {
      mechMarkerRef.current.setLatLng(mLatLng);
      mechMarkerRef.current.setIcon(buildMechanicIcon(isLive));
    } else {
      mechMarkerRef.current = L.marker(mLatLng, { icon: buildMechanicIcon(isLive) })
        .addTo(map)
        .bindPopup("<b>🔧 Mechanic Location</b>");
    }

    // Polyline between user and mechanic
    if (polylineRef.current) {
      polylineRef.current.setLatLngs([uLatLng, mLatLng]);
    } else {
      polylineRef.current = L.polyline([uLatLng, mLatLng], {
        color: "#f97316",
        weight: 3,
        opacity: 0.6,
        dashArray: "8 6",
      }).addTo(map);
    }

    // ETA tooltip on the midpoint of the polyline
    const distKm = haversineKm(lat, lng, mechanicLat, mechanicLng);
    const etaMins = Math.round((distKm / 40) * 60); // assume 40 km/h
    const etaText = distKm < 0.1
      ? "🟢 Mechanic nearby!"
      : `📍 ${distKm.toFixed(1)} km · ~${etaMins} min away`;

    const midLat = (lat + mechanicLat) / 2;
    const midLng = (lng + mechanicLng) / 2;

    if (etaTooltipRef.current) {
      etaTooltipRef.current.setLatLng([midLat, midLng]).setContent(etaText);
    } else {
      etaTooltipRef.current = L.tooltip({ permanent: true, direction: "top", className: "eta-tooltip" })
        .setLatLng([midLat, midLng])
        .setContent(etaText)
        .addTo(map);
    }

    // Fit bounds to show both markers
    try {
      map.fitBounds(L.latLngBounds([uLatLng, mLatLng]), { padding: [40, 40], maxZoom: 15 });
    } catch {
      /* no-op */
    }
  }, [mechanicLat, mechanicLng, lat, lng, isLive]);

  return (
    <>
      <style>{`
        .eta-tooltip {
          background: rgba(15,15,20,0.9) !important;
          border: 1px solid rgba(249,115,22,0.4) !important;
          color: #f97316 !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          padding: 4px 10px !important;
          border-radius: 8px !important;
          white-space: nowrap !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important;
        }
        .eta-tooltip::before { display: none !important; }
        .leaflet-tooltip-bottom.eta-tooltip::before { display: none !important; }
      `}</style>
      <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: "300px" }} />
    </>
  );
}

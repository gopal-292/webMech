"use client";

import { useEffect, useRef, useState } from "react";

interface LiveLocationState {
  isTracking: boolean;
  coords: { lat: number; lng: number } | null;
  error: string | null;
}

/**
 * Hook for the mechanic side — watches GPS position via Geolocation API and
 * pushes updates to /api/mechanic/location/live every ~5 seconds or when
 * the mechanic moves more than 10 metres.
 *
 * @param enabled  Pass true when the mechanic is actively en-route (ON_WAY / ARRIVED)
 */
export function useLiveLocation(enabled: boolean): LiveLocationState {
  const [state, setState] = useState<LiveLocationState>({
    isTracking: false,
    coords: null,
    error: null,
  });

  const lastPushRef = useRef<{ lat: number; lng: number; time: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      // Stop watching when not needed
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setState((s) => ({ ...s, isTracking: false }));
      return;
    }

    if (!navigator.geolocation) {
      setState({ isTracking: false, coords: null, error: "Geolocation not supported" });
      return;
    }

    const PUSH_INTERVAL_MS = 5_000;   // minimum milliseconds between pushes
    const MIN_DISTANCE_M  = 10;       // minimum metres moved to trigger a push

    const haversineMetres = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6_371_000;
      const toRad = (d: number) => (d * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const pushLocation = async (lat: number, lng: number) => {
      try {
        await fetch("/api/mechanic/location/live", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lng }),
        });
        lastPushRef.current = { lat, lng, time: Date.now() };
      } catch {
        // Fail silently — next watchPosition callback will retry
      }
    };

    setState((s) => ({ ...s, isTracking: true, error: null }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setState((s) => ({ ...s, coords: { lat, lng }, error: null }));

        const last = lastPushRef.current;
        const now  = Date.now();
        const timeSincePush = last ? now - last.time : Infinity;
        const distanceMoved = last ? haversineMetres(last.lat, last.lng, lat, lng) : Infinity;

        if (timeSincePush >= PUSH_INTERVAL_MS || distanceMoved >= MIN_DISTANCE_M) {
          pushLocation(lat, lng);
        }
      },
      (err) => {
        setState((s) => ({
          ...s,
          isTracking: false,
          error: err.code === 1 ? "Location permission denied" : "GPS unavailable",
        }));
      },
      { enableHighAccuracy: true, maximumAge: 3_000, timeout: 10_000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled]);

  return state;
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate distance between two lat/lng points in km (Haversine formula)
 */
export function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatRelativeTime(dateStr: string | Date): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  ON_WAY: "On the Way",
  ARRIVED: "Mechanic Arrived",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  ACCEPTED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ON_WAY: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  ARRIVED: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

export const VEHICLE_TYPES = [
  "Car",
  "Motorcycle",
  "Truck",
  "Bus",
  "Auto Rickshaw",
  "SUV",
  "Van",
  "Other",
];

export const ISSUE_TYPES = [
  "Engine won't start",
  "Flat tyre",
  "Battery dead",
  "Overheating",
  "Brake failure",
  "Fuel empty",
  "Transmission issue",
  "Electrical problem",
  "Accident damage",
  "Other",
];

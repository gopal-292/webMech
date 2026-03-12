"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import useSWR from "swr";
import Link from "next/link";
import {
  MapPin, Clock, Phone, Star, ChevronLeft, Loader2,
  CheckCircle, XCircle, Radio,
} from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, cn, formatRelativeTime } from "@/lib/utils";
import { useState } from "react";

const RequestMap = dynamic(() => import("@/components/RequestMap"), { ssr: false });

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const STATUS_STEPS = ["PENDING", "ACCEPTED", "ON_WAY", "ARRIVED", "COMPLETED"];

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function TrackPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data, mutate } = useSWR(`/api/requests/${params.id}`, fetcher, {
    refreshInterval: 5000,
  });
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [reviewed, setReviewed] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Store prev mechanic coords so map doesn't jump to 0,0 between polls
  const prevMechCoords = useRef<{ lat: number; lng: number } | null>(null);

  const request = data?.request;
  const mechanic = request?.mechanic;
  const isLive = ["ON_WAY", "ACCEPTED"].includes(request?.status ?? "");
  const isCompleted = request?.status === "COMPLETED";
  const isCancelled = request?.status === "CANCELLED";

  // Keep the last known mechanic coords
  if (mechanic?.lat && mechanic?.lng) {
    prevMechCoords.current = { lat: mechanic.lat, lng: mechanic.lng };
  }

  const mechLat = mechanic?.lat || prevMechCoords.current?.lat;
  const mechLng = mechanic?.lng || prevMechCoords.current?.lng;

  const distKm = mechLat && mechLng
    ? haversineKm(request?.latitude ?? 0, request?.longitude ?? 0, mechLat, mechLng)
    : null;
  const etaMins = distKm !== null ? Math.round((distKm / 40) * 60) : null;

  const mechAvgRating = mechanic?.reviewsReceived?.length
    ? (
        mechanic.reviewsReceived.reduce((s: number, r: any) => s + r.rating, 0) /
        mechanic.reviewsReceived.length
      ).toFixed(1)
    : null;

  const submitReview = async () => {
    if (!mechanic || reviewed) return;
    setSubmittingReview(true);
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceRequestId: request.id,
        mechanicId: mechanic.id,
        rating: review.rating,
        comment: review.comment,
      }),
    });
    setReviewed(true);
    setSubmittingReview(false);
    mutate();
  };

  const cancelRequest = async () => {
    await fetch(`/api/requests/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    mutate();
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-dark-400">Request not found.</p>
          <Link href="/dashboard" className="btn-primary mt-4 inline-flex">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIdx = STATUS_STEPS.indexOf(request.status);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-6 text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Request Tracking</h1>
              {isLive && mechanic && (
                <p className="flex items-center gap-1.5 text-green-400 text-sm font-semibold mt-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                  </span>
                  LIVE · mechanic location updating
                </p>
              )}
            </div>
            <span className={cn("badge text-sm px-3 py-1", STATUS_COLORS[request.status])}>
              {STATUS_LABELS[request.status]}
            </span>
          </div>

          {/* Progress steps */}
          {!isCancelled && (
            <div className="card p-6 mb-6">
              <div className="flex items-center">
                {STATUS_STEPS.map((s, i) => (
                  <div key={s} className="flex items-center flex-1">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all",
                        i < currentStepIdx
                          ? "bg-green-500 text-white"
                          : i === currentStepIdx
                          ? "bg-brand-500 text-white ring-4 ring-brand-500/30"
                          : "bg-dark-700 text-dark-500"
                      )}
                    >
                      {i < currentStepIdx ? "✓" : i + 1}
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div
                        className={cn(
                          "h-1 flex-1 mx-1 rounded transition-all",
                          i < currentStepIdx ? "bg-green-500" : "bg-dark-700"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {STATUS_STEPS.map((s) => (
                  <p key={s} className="text-xs text-dark-500 flex-1 text-center">
                    {STATUS_LABELS[s]}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* ETA banner — shown when mechanic is en-route */}
          {isLive && mechanic && distKm !== null && (
            <div className="mb-4 rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-3 flex items-center gap-3">
              <Radio className="w-5 h-5 text-green-400 shrink-0 animate-pulse" />
              <div>
                <p className="text-green-300 font-semibold text-sm">
                  {distKm < 0.15
                    ? "🟢 Mechanic is right around the corner!"
                    : `Mechanic is ${distKm.toFixed(1)} km away`}
                </p>
                {etaMins !== null && distKm >= 0.15 && (
                  <p className="text-green-500 text-xs">Estimated arrival: ~{etaMins} min</p>
                )}
              </div>
            </div>
          )}

          {/* Map */}
          <div className="map-container h-96 mb-6">
            <RequestMap
              lat={request.latitude}
              lng={request.longitude}
              mechanicLat={mechLat}
              mechanicLng={mechLng}
              isLive={isLive}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Request details */}
            <div className="card p-5">
              <h3 className="font-semibold text-white mb-3">Request Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex gap-3">
                  <span className="text-dark-500 w-20">Vehicle</span>
                  <span className="text-white">
                    {request.vehicleType} {request.vehicleModel}
                  </span>
                </div>
                <div className="flex gap-3">
                  <span className="text-dark-500 w-20">Issue</span>
                  <span className="text-white">{request.issueDescription}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-dark-500 w-20">Location</span>
                  <span className="text-white text-xs">{request.address}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-dark-500 w-20">Time</span>
                  <span className="text-white">{formatRelativeTime(request.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Mechanic info */}
            {mechanic ? (
              <div className="card p-5">
                <h3 className="font-semibold text-white mb-3">Your Mechanic</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🔧</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{mechanic.user.name}</p>
                    <p className="text-dark-400 text-sm">{mechanic.specializations}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {mechAvgRating && (
                    <div className="flex gap-3">
                      <span className="text-dark-500 w-20">Rating</span>
                      <span className="text-yellow-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400" /> {mechAvgRating}/5
                      </span>
                    </div>
                  )}
                  {mechanic.user.phone && (
                    <div className="flex gap-3">
                      <span className="text-dark-500 w-20">Phone</span>
                      <a
                        href={`tel:${mechanic.user.phone}`}
                        className="text-brand-400 hover:text-brand-300 flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" /> {mechanic.user.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card p-5 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-dark-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
                  </div>
                  <p className="text-dark-400 text-sm">
                    Waiting for a mechanic to accept your request...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cancel */}
          {!isCompleted && !isCancelled && request.status === "PENDING" && (
            <button onClick={cancelRequest} className="btn-danger w-full mb-4">
              <XCircle className="w-4 h-4" /> Cancel Request
            </button>
          )}

          {/* Review form */}
          {isCompleted && mechanic && !request.review && !reviewed && (
            <div className="card p-6">
              <h3 className="text-lg font-bold text-white mb-4">Rate Your Mechanic</h3>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReview({ ...review, rating: star })}
                    className={cn(
                      "text-3xl transition-transform hover:scale-110",
                      star <= review.rating ? "opacity-100" : "opacity-30"
                    )}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <textarea
                className="input-field resize-none mb-4"
                rows={3}
                placeholder="Share your experience..."
                value={review.comment}
                onChange={(e) => setReview({ ...review, comment: e.target.value })}
              />
              <button
                id="submit-review"
                onClick={submitReview}
                disabled={submittingReview}
                className="btn-primary w-full"
              >
                {submittingReview ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          )}

          {(reviewed || request.review) && isCompleted && (
            <div className="card p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-white font-semibold">Thanks for your review!</p>
              <Link href="/dashboard" className="btn-primary mt-4 inline-flex">
                Back to Dashboard
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

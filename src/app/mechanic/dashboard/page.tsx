"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import useSWR from "swr";
import { Wrench, MapPin, Clock, CheckCircle, XCircle, Loader2, Navigation, Radio } from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, cn, formatRelativeTime } from "@/lib/utils";
import { useLiveLocation } from "@/hooks/useLiveLocation";

const RequestMap = dynamic(() => import("@/components/RequestMap"), { ssr: false });

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MechanicDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [available, setAvailable] = useState(true);
  const [updatingAvail, setUpdatingAvail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const { data: pendingData, mutate: mutatePending } = useSWR(
    "/api/mechanic/requests", fetcher, { refreshInterval: 8000 }
  );
  const { data: myRequestsData, mutate: mutateMyRequests } = useSWR(
    "/api/requests", fetcher, { refreshInterval: 5000 }
  );

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Determine active job early so we can pass it to the hook
  const myRequests = myRequestsData?.requests || [];
  const activeJob = myRequests.find((r: any) => ["ACCEPTED", "ON_WAY", "ARRIVED"].includes(r.status));

  // Live GPS broadcasting — activates automatically when mechanic is on their way
  const isEnRoute = activeJob?.status === "ON_WAY" || activeJob?.status === "ARRIVED";
  const { isTracking, coords: liveCoords, error: gpsError } = useLiveLocation(isEnRoute);

  // Use live coords for the map; fall back to 0 until GPS kicks in
  const mechLat = liveCoords?.lat ?? 0;
  const mechLng = liveCoords?.lng ?? 0;

  const toggleAvailability = async () => {
    setUpdatingAvail(true);
    const newAvail = !available;
    await fetch("/api/mechanic/location", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: newAvail }),
    });
    setAvailable(newAvail);
    setUpdatingAvail(false);
  };

  const acceptRequest = async (requestId: string) => {
    const mechanicId = (session?.user as any)?.mechanicId;
    setUpdatingStatus(requestId);
    await fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ACCEPTED", mechanicId }),
    });
    mutatePending();
    mutateMyRequests();
    setUpdatingStatus(null);
  };

  const updateStatus = async (requestId: string, newStatus: string) => {
    setUpdatingStatus(requestId);
    await fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    mutateMyRequests();
    setUpdatingStatus(null);
  };

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-400" /></div>;
  }

  const mechanicApproved = (session?.user as any)?.mechanicApproved;
  const pendingRequests = pendingData?.requests || [];

  if (!mechanicApproved) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center pt-20 px-4">
          <div className="card p-10 text-center max-w-md w-full">
            <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Pending Approval</h2>
            <p className="text-dark-400">
              Your mechanic profile is under review by our admin team. You'll be able to accept jobs once approved.
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Mechanic Dashboard 🔧</h1>
              <p className="text-dark-400 mt-1">Manage your jobs and availability</p>
            </div>
            <button id="toggle-availability" onClick={toggleAvailability} disabled={updatingAvail}
              className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border transition-all",
                available ? "bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30"
                          : "bg-dark-800 border-dark-700 text-dark-400 hover:border-dark-500")}>
              {updatingAvail ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className={cn("w-2 h-2 rounded-full", available ? "bg-green-400" : "bg-dark-500")} />}
              {available ? "Available" : "Offline"}
            </button>
          </div>

          {/* Active job */}
          {activeJob && (
            <div className="mb-8 card p-6 border-brand-500/30">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
                Active Job
                {isTracking && (
                  <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/30 px-2.5 py-1 rounded-lg">
                    <Radio className="w-3 h-3 animate-pulse" />
                    Broadcasting GPS
                  </span>
                )}
                {gpsError && (
                  <span className="ml-auto text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg">
                    ⚠ {gpsError}
                  </span>
                )}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-white font-medium">{activeJob.user.name}</p>
                  <p className="text-dark-400 text-sm">{activeJob.vehicleType} — {activeJob.issueDescription}</p>
                  <p className="text-dark-400 text-sm mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {activeJob.address}
                  </p>
                  {activeJob.user.phone && (
                    <a href={`tel:${activeJob.user.phone}`} className="text-brand-400 text-sm mt-2 flex items-center gap-1 hover:text-brand-300">
                      📞 {activeJob.user.phone}
                    </a>
                  )}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {activeJob.status === "ACCEPTED" && (
                      <button onClick={() => updateStatus(activeJob.id, "ON_WAY")} disabled={!!updatingStatus} className="btn-primary text-sm py-2">
                        {updatingStatus === activeJob.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "🚗 I'm On the Way"}
                      </button>
                    )}
                    {activeJob.status === "ON_WAY" && (
                      <button onClick={() => updateStatus(activeJob.id, "ARRIVED")} disabled={!!updatingStatus} className="btn-primary text-sm py-2">
                        {updatingStatus === activeJob.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "📍 I've Arrived"}
                      </button>
                    )}
                    {activeJob.status === "ARRIVED" && (
                      <button onClick={() => updateStatus(activeJob.id, "COMPLETED")} disabled={!!updatingStatus} className="btn-success text-sm py-2">
                        {updatingStatus === activeJob.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "✅ Mark as Completed"}
                      </button>
                    )}
                  </div>
                </div>
                <div className="map-container h-40">
                  <RequestMap lat={activeJob.latitude} lng={activeJob.longitude} mechanicLat={mechLat} mechanicLng={mechLng} />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending requests to accept */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                Incoming Requests ({pendingRequests.length})
              </h2>
              {pendingRequests.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-dark-400 text-sm">No pending requests right now. Stay available!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req: any) => (
                    <div key={req.id} className="card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">{req.vehicleType} — {req.issueDescription}</p>
                          <p className="text-dark-400 text-xs mt-1">{req.user.name} · {formatRelativeTime(req.createdAt)}</p>
                          <p className="text-dark-500 text-xs mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {req.address || `${req.latitude.toFixed(3)}, ${req.longitude.toFixed(3)}`}
                          </p>
                        </div>
                        <button onClick={() => acceptRequest(req.id)} disabled={!!updatingStatus || !!activeJob}
                          className="btn-success text-sm py-2 px-4 shrink-0"
                          title={activeJob ? "Finish active job first" : "Accept"}>
                          {updatingStatus === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Accept"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My job history */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">My Job History</h2>
              {myRequests.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-dark-400 text-sm">No jobs yet. Accept requests to get started!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {myRequests.map((req: any) => (
                    <div key={req.id} className="card p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white text-sm">{req.vehicleType} — {req.issueDescription}</p>
                          <p className="text-dark-400 text-xs mt-0.5">{req.user.name} · {formatRelativeTime(req.createdAt)}</p>
                          {req.review && (
                            <p className="text-yellow-400 text-xs mt-1">{"⭐".repeat(req.review.rating)} Review received</p>
                          )}
                        </div>
                        <span className={cn("badge", STATUS_COLORS[req.status])}>{STATUS_LABELS[req.status]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

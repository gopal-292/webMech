"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import useSWR from "swr";
import { Shield, CheckCircle, XCircle, Users, Wrench, Star, Loader2, Clock } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<"pending" | "approved" | "requests">("pending");
  const [updating, setUpdating] = useState<string | null>(null);

  const { data: pendingData, mutate: mutatePending } = useSWR("/api/admin/mechanics?approved=false", fetcher);
  const { data: approvedData, mutate: mutateApproved } = useSWR("/api/admin/mechanics?approved=true", fetcher);
  const { data: requestsData } = useSWR("/api/requests", fetcher, { refreshInterval: 10000 });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") router.push("/");
  }, [status, session, router]);

  const approveMechanic = async (mechanicId: string, isApproved: boolean) => {
    setUpdating(mechanicId);
    await fetch("/api/admin/mechanics", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mechanicId, isApproved }),
    });
    mutatePending();
    mutateApproved();
    setUpdating(null);
  };

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-400" /></div>;
  }

  const pendingMechanics = pendingData?.mechanics || [];
  const approvedMechanics = approvedData?.mechanics || [];
  const allRequests = requestsData?.requests || [];

  const stats = [
    { label: "Pending Approvals", value: pendingMechanics.length, icon: Clock, color: "text-yellow-400" },
    { label: "Approved Mechanics", value: approvedMechanics.length, icon: Wrench, color: "text-green-400" },
    { label: "Total Requests", value: allRequests.length, icon: Users, color: "text-blue-400" },
    { label: "Active Now", value: allRequests.filter((r: any) => !["COMPLETED", "CANCELLED"].includes(r.status)).length, icon: Shield, color: "text-brand-400" },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Shield className="w-8 h-8 text-brand-400" />
              Admin Panel
            </h1>
            <p className="text-dark-400 mt-1">Manage mechanics and monitor service requests</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="card p-5 text-center">
                <s.icon className={cn("w-7 h-7 mx-auto mb-2", s.color)} />
                <div className="text-3xl font-bold text-white">{s.value}</div>
                <div className="text-dark-400 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-dark-900 border border-dark-700 rounded-xl p-1 mb-6 w-fit">
            {[
              { key: "pending", label: `Pending (${pendingMechanics.length})` },
              { key: "approved", label: `Mechanics (${approvedMechanics.length})` },
              { key: "requests", label: `Requests (${allRequests.length})` },
            ].map((t) => (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                className={cn("px-5 py-2 rounded-lg text-sm font-medium transition-all",
                  tab === t.key ? "bg-brand-500 text-white" : "text-dark-400 hover:text-white")}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Pending mechanics */}
          {tab === "pending" && (
            <div>
              {pendingMechanics.length === 0 ? (
                <div className="card p-10 text-center">
                  <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
                  <p className="text-dark-400">No pending approvals — all caught up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingMechanics.map((m: any) => (
                    <div key={m.id} className="card p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center">
                          <Wrench className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{m.user.name}</p>
                          <p className="text-dark-400 text-sm">{m.user.email}</p>
                          <p className="text-dark-500 text-xs mt-0.5">
                            Specializations: {m.specializations} · Vehicles: {m.vehicleTypes}
                          </p>
                          <p className="text-dark-500 text-xs">Registered {formatRelativeTime(m.user.createdAt)}</p>
                          {m.bio && <p className="text-dark-400 text-xs mt-1 italic">"{m.bio}"</p>}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button id={`approve-${m.id}`} onClick={() => approveMechanic(m.id, true)} disabled={!!updating}
                          className="btn-success text-sm py-2 px-4">
                          {updating === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Approve</>}
                        </button>
                        <button id={`reject-${m.id}`} onClick={() => approveMechanic(m.id, false)} disabled={!!updating}
                          className="btn-danger text-sm py-2 px-4">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Approved mechanics */}
          {tab === "approved" && (
            <div className="space-y-3">
              {approvedMechanics.map((m: any) => {
                const avgRating = m.reviewsReceived?.length
                  ? (m.reviewsReceived.reduce((s: number, r: any) => s + r.rating, 0) / m.reviewsReceived.length).toFixed(1)
                  : null;
                return (
                  <div key={m.id} className="card p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{m.user.name}</p>
                        <p className="text-dark-400 text-sm">{m.user.email} {m.user.phone && `· ${m.user.phone}`}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-dark-500 text-xs">{m._count?.serviceRequests || 0} jobs</span>
                          {avgRating && <span className="text-yellow-400 text-xs flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400" /> {avgRating}</span>}
                          <span className={cn("text-xs", m.isAvailable ? "text-green-400" : "text-dark-500")}>
                            {m.isAvailable ? "● Available" : "○ Offline"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => approveMechanic(m.id, false)} disabled={!!updating}
                      className="btn-danger text-sm py-2 px-3">
                      Revoke
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* All requests */}
          {tab === "requests" && (
            <div className="space-y-3">
              {allRequests.length === 0 ? (
                <div className="card p-10 text-center"><p className="text-dark-400">No service requests yet.</p></div>
              ) : (
                allRequests.map((req: any) => (
                  <div key={req.id} className="card p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-white text-sm">{req.vehicleType} — {req.issueDescription}</p>
                      <p className="text-dark-400 text-xs mt-0.5">
                        User: {req.user?.name} · {formatRelativeTime(req.createdAt)}
                      </p>
                    </div>
                    <span className={cn("badge text-xs px-2.5 py-1",
                      req.status === "COMPLETED" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                      req.status === "CANCELLED" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                      "bg-yellow-500/20 text-yellow-400 border-yellow-500/30")}>
                      {req.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

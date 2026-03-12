"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { MapPin, Clock, Plus, ChevronRight, Wrench, Star } from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data } = useSWR("/api/requests", fetcher, { refreshInterval: 10000 });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const requests = data?.requests || [];
  const activeRequest = requests.find((r: any) => !["COMPLETED", "CANCELLED"].includes(r.status));

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Hello, {session?.user?.name?.split(" ")[0]} 👋
              </h1>
              <p className="text-dark-400 mt-1">Need roadside help? Report your breakdown.</p>
            </div>
            <Link id="new-request-btn" href="/dashboard/request" className="btn-primary">
              <Plus className="w-5 h-5" />
              Get Help
            </Link>
          </div>

          {/* Active request card */}
          {activeRequest && (
            <div className="mb-8 relative overflow-hidden rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-500/10 via-dark-900/80 to-dark-900/80 p-6">
              <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-brand-400 text-sm font-semibold mb-1">ACTIVE REQUEST</p>
                  <h3 className="text-xl font-bold text-white">{activeRequest.vehicleType} — {activeRequest.issueDescription}</h3>
                  <p className="text-dark-400 text-sm mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {activeRequest.address || "Location recorded"}
                  </p>
                  <span className={cn("badge mt-3", STATUS_COLORS[activeRequest.status])}>
                    {STATUS_LABELS[activeRequest.status]}
                  </span>
                </div>
                <Link href={`/dashboard/track/${activeRequest.id}`} className="btn-primary text-sm">
                  Track
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: "Total Requests", value: requests.length, icon: Wrench },
              { label: "Completed", value: requests.filter((r: any) => r.status === "COMPLETED").length, icon: Star },
              { label: "Active", value: requests.filter((r: any) => !["COMPLETED", "CANCELLED"].includes(r.status)).length, icon: Clock },
            ].map((stat) => (
              <div key={stat.label} className="card p-5 text-center">
                <stat.icon className="w-6 h-6 text-brand-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-dark-400 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Request history */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Request History</h2>
            {requests.length === 0 ? (
              <div className="card p-12 text-center">
                <Wrench className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                <p className="text-dark-400">No requests yet. Get help when you need it!</p>
                <Link href="/dashboard/request" className="btn-primary mt-6 inline-flex">
                  <Plus className="w-4 h-4" /> New Request
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req: any) => (
                  <Link key={req.id} href={`/dashboard/track/${req.id}`}
                    className="card p-5 flex items-center justify-between hover:border-dark-600 transition-all group">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-dark-800 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-brand-500/10 transition-colors">
                        <Wrench className="w-5 h-5 text-brand-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{req.vehicleType} — {req.issueDescription}</p>
                        <p className="text-dark-400 text-sm mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatRelativeTime(req.createdAt)}
                        </p>
                        {req.mechanic && (
                          <p className="text-dark-400 text-sm mt-0.5">
                            Mechanic: {req.mechanic.user.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn("badge", STATUS_COLORS[req.status])}>
                        {STATUS_LABELS[req.status]}
                      </span>
                      <ChevronRight className="w-4 h-4 text-dark-600 group-hover:text-brand-400 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Wrench, Loader2, User, Car } from "lucide-react";
import { VEHICLE_TYPES } from "@/lib/utils";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"USER" | "MECHANIC">("USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get("role") === "mechanic") setActiveTab("MECHANIC");
  }, [searchParams]);

  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    bio: "", specializations: "", vehicleTypes: ["Car"], serviceRadius: "20",
  });

  const toggleVehicle = (v: string) => {
    setForm((f) => ({
      ...f,
      vehicleTypes: f.vehicleTypes.includes(v)
        ? f.vehicleTypes.filter((x) => x !== v)
        : [...f.vehicleTypes, v],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        role: activeTab,
        vehicleTypes: form.vehicleTypes.join(","),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Registration failed. Please try again.");
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
          <p className="text-dark-400">
            {activeTab === "MECHANIC"
              ? "Your mechanic profile is pending admin approval. You'll be notified shortly."
              : "Redirecting you to login..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl text-white">Web<span className="text-brand-400">Mech</span></span>
          </Link>
          <h1 className="text-3xl font-bold text-white mt-4">Create your account</h1>
        </div>

        {/* Role tabs */}
        <div className="flex rounded-xl bg-dark-900 border border-dark-700 p-1 mb-6">
          <button
            id="tab-user"
            onClick={() => setActiveTab("USER")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all ${
              activeTab === "USER" ? "bg-brand-500 text-white shadow-lg" : "text-dark-400 hover:text-white"
            }`}
          >
            <Car className="w-4 h-4" /> I Need Help
          </button>
          <button
            id="tab-mechanic"
            onClick={() => setActiveTab("MECHANIC")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all ${
              activeTab === "MECHANIC" ? "bg-brand-500 text-white shadow-lg" : "text-dark-400 hover:text-white"
            }`}
          >
            <Wrench className="w-4 h-4" /> I'm a Mechanic
          </button>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input id="name" type="text" required className="input-field" placeholder="John Doe"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Phone (optional)</label>
                <input id="phone" type="tel" className="input-field" placeholder="+91 98765 43210"
                  value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="label">Email address</label>
              <input id="signup-email" type="email" required className="input-field" placeholder="you@example.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>

            <div>
              <label className="label">Password</label>
              <input id="signup-password" type="password" required minLength={6} className="input-field" placeholder="Min. 6 characters"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>

            {/* Mechanic-only fields */}
            {activeTab === "MECHANIC" && (
              <>
                <div>
                  <label className="label">Bio / About You</label>
                  <textarea className="input-field resize-none" rows={3} placeholder="Describe your experience..."
                    value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                </div>
                <div>
                  <label className="label">Specializations</label>
                  <input type="text" className="input-field" placeholder="e.g. Engine repair, Tyre change"
                    value={form.specializations} onChange={(e) => setForm({ ...form, specializations: e.target.value })} />
                </div>
                <div>
                  <label className="label">Vehicle Types You Service</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {VEHICLE_TYPES.map((v) => (
                      <button key={v} type="button" onClick={() => toggleVehicle(v)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                          form.vehicleTypes.includes(v)
                            ? "bg-brand-500/20 border-brand-500/50 text-brand-400"
                            : "bg-dark-800 border-dark-700 text-dark-400 hover:border-dark-500"
                        }`}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Service Radius (km): {form.serviceRadius} km</label>
                  <input type="range" min="5" max="100" step="5" className="w-full accent-brand-500"
                    value={form.serviceRadius} onChange={(e) => setForm({ ...form, serviceRadius: e.target.value })} />
                </div>
              </>
            )}

            <button id="signup-submit" type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Create ${activeTab === "MECHANIC" ? "Mechanic" : ""} Account`}
            </button>
          </form>

          <p className="text-center text-dark-400 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import { MapPin, Loader2, Wrench, Star, Navigation, ChevronRight, AlertTriangle } from "lucide-react";
import { VEHICLE_TYPES, ISSUE_TYPES, cn } from "@/lib/utils";

// Dynamically import map to avoid SSR issues
const RequestMap = dynamic(() => import("@/components/RequestMap"), { ssr: false });

export default function RequestPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    lat: 0, lng: 0,
    address: "",
    vehicleType: "", vehicleModel: "",
    issueDescription: "",
  });
  const [selectedMechanic, setSelectedMechanic] = useState<any>(null);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [loadingMechanics, setLoadingMechanics] = useState(false);

  const getLocation = () => {
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm((f) => ({ ...f, lat: latitude, lng: longitude }));

        // Reverse geocode using Nominatim (free, no API key)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          setForm((f) => ({ ...f, address: data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
        } catch {
          setForm((f) => ({ ...f, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
        }
        setLocating(false);
      },
      () => {
        // Fallback to demo location (Bangalore center)
        setForm((f) => ({ ...f, lat: 12.9716, lng: 77.5946, address: "Demo location — Bangalore, India" }));
        setLocating(false);
        setError("Could not get GPS location. Using a demo location.");
      },
      { timeout: 8000 }
    );
  };

  const findMechanics = async () => {
    setLoadingMechanics(true);
    try {
      const res = await fetch(`/api/mechanics/nearby?lat=${form.lat}&lng=${form.lng}&radius=50`);
      const data = await res.json();
      setMechanics(data.mechanics || []);
    } catch {
      setMechanics([]);
    }
    setLoadingMechanics(false);
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleType || !form.issueDescription) return;
    await findMechanics();
    setStep(2);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mechanicId: selectedMechanic?.id || null,
          latitude: form.lat,
          longitude: form.lng,
          address: form.address,
          vehicleType: form.vehicleType,
          vehicleModel: form.vehicleModel,
          issueDescription: form.issueDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/dashboard/track/${data.request.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to submit request");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress steps */}
          <div className="flex items-center gap-2 mb-10">
            {["Your Location & Issue", "Select Mechanic", "Confirm"].map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all",
                  i + 1 < step ? "bg-green-500 text-white" :
                  i + 1 === step ? "bg-brand-500 text-white ring-4 ring-brand-500/30" :
                  "bg-dark-800 text-dark-400"
                )}>
                  {i + 1 < step ? "✓" : i + 1}
                </div>
                <span className={cn("text-xs font-medium hidden sm:block", i + 1 === step ? "text-white" : "text-dark-500")}>
                  {label}
                </span>
                {i < 2 && <div className={cn("h-px flex-1 transition-all", i + 1 < step ? "bg-green-500" : "bg-dark-700")} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 text-yellow-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* STEP 1: Location + Issue */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div className="card p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-400" /> Your Location
                </h2>
                <button id="detect-location" type="button" onClick={getLocation} disabled={locating}
                  className="btn-secondary w-full py-3 mb-4">
                  {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                  {locating ? "Detecting location..." : "Detect My Location (GPS)"}
                </button>
                {form.lat !== 0 && (
                  <>
                    <div className="map-container h-48 mb-4">
                      <RequestMap lat={form.lat} lng={form.lng} mechanics={[]} onSelect={() => {}} />
                    </div>
                    <input type="text" className="input-field" placeholder="Your address"
                      value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  </>
                )}
              </div>

              <div className="card p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-brand-400" /> Vehicle & Issue
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Vehicle Type *</label>
                    <div className="flex flex-wrap gap-2">
                      {VEHICLE_TYPES.map((v) => (
                        <button key={v} type="button" onClick={() => setForm({ ...form, vehicleType: v })}
                          className={cn("px-3 py-2 rounded-lg text-sm font-medium border transition-all", form.vehicleType === v
                            ? "bg-brand-500/20 border-brand-500/50 text-brand-400"
                            : "bg-dark-800 border-dark-700 text-dark-400 hover:border-dark-500")}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label">Vehicle Model (optional)</label>
                    <input type="text" className="input-field" placeholder="e.g. Honda Activa, Maruti Swift"
                      value={form.vehicleModel} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">What's the issue? *</label>
                    <div className="flex flex-wrap gap-2">
                      {ISSUE_TYPES.map((issue) => (
                        <button key={issue} type="button" onClick={() => setForm({ ...form, issueDescription: issue })}
                          className={cn("px-3 py-2 rounded-lg text-sm font-medium border transition-all", form.issueDescription === issue
                            ? "bg-brand-500/20 border-brand-500/50 text-brand-400"
                            : "bg-dark-800 border-dark-700 text-dark-400 hover:border-dark-500")}>
                          {issue}
                        </button>
                      ))}
                    </div>
                    <textarea className="input-field mt-3 resize-none" rows={2} placeholder="Describe the issue in detail..."
                      value={form.issueDescription} onChange={(e) => setForm({ ...form, issueDescription: e.target.value })} />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={!form.vehicleType || !form.issueDescription || form.lat === 0}
                className="btn-primary w-full py-4 text-lg">
                Find Nearby Mechanics <ChevronRight className="w-5 h-5" />
              </button>
              {form.lat === 0 && <p className="text-center text-dark-500 text-sm">Please detect your location first</p>}
            </form>
          )}

          {/* STEP 2: Pick Mechanic */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="card p-0 overflow-hidden">
                <div className="map-container h-72">
                  <RequestMap lat={form.lat} lng={form.lng} mechanics={mechanics}
                    selectedId={selectedMechanic?.id} onSelect={(m: any) => setSelectedMechanic(m)} />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-4">
                  {loadingMechanics ? "Finding mechanics..." : `${mechanics.length} Mechanic${mechanics.length !== 1 ? "s" : ""} Nearby`}
                </h2>
                {loadingMechanics ? (
                  <div className="card p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-brand-400 mx-auto" /></div>
                ) : mechanics.length === 0 ? (
                  <div className="card p-10 text-center">
                    <p className="text-dark-400 mb-2">No approved mechanics found near your location.</p>
                    <p className="text-dark-500 text-sm">You can still send a broadcast request — we'll notify nearby mechanics.</p>
                    <button onClick={() => setStep(3)} className="btn-primary mt-4">Continue without selecting</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mechanics.map((m: any) => {
                      const avgRating = m.avgRating ? m.avgRating.toFixed(1) : null;
                      const isSelected = selectedMechanic?.id === m.id;
                      return (
                        <button key={m.id} onClick={() => setSelectedMechanic(isSelected ? null : m)}
                          className={cn("w-full card p-5 text-left flex items-center gap-4 transition-all hover:border-brand-500/40",
                            isSelected && "border-brand-500/60 bg-brand-500/5")}>
                          <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center shrink-0">
                            <Wrench className="w-6 h-6 text-brand-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-white">{m.user.name}</p>
                            <p className="text-sm text-dark-400 mt-0.5">{m.specializations}</p>
                            <div className="flex items-center gap-3 mt-1">
                              {avgRating && (
                                <span className="flex items-center gap-1 text-yellow-400 text-xs">
                                  <Star className="w-3 h-3 fill-yellow-400" /> {avgRating}
                                </span>
                              )}
                              <span className="text-dark-400 text-xs flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {m.distance.toFixed(1)} km away
                              </span>
                            </div>
                          </div>
                          {isSelected && <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1">
                  {selectedMechanic ? `Request ${selectedMechanic.user.name}` : "Send Broadcast Request"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirm */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="card p-8">
                <h2 className="text-xl font-bold text-white mb-6">Confirm Your Request</h2>
                <div className="space-y-4">
                  {[
                    { label: "Location", value: form.address },
                    { label: "Vehicle", value: `${form.vehicleType}${form.vehicleModel ? ` — ${form.vehicleModel}` : ""}` },
                    { label: "Issue", value: form.issueDescription },
                    { label: "Mechanic", value: selectedMechanic ? selectedMechanic.user.name : "Broadcast to all nearby mechanics" },
                  ].map((item) => (
                    <div key={item.label} className="flex gap-4">
                      <span className="text-dark-500 text-sm w-20 shrink-0 pt-0.5">{item.label}</span>
                      <span className="text-white text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
                <button id="confirm-request" onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 py-4">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "🚨 Send Request"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

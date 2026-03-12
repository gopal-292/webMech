// ─── Client-side API helper ────────────────────────────────────────────────
// All functions in this file make fetch calls to the Next.js API routes
// which in turn query the SQLite database via Prisma.
// ──────────────────────────────────────────────────────────────────────────

// ── Auth ──────────────────────────────────────────────────────────────────

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "USER" | "MECHANIC";
  bio?: string;
  specializations?: string;
  vehicleTypes?: string;
  serviceRadius?: number;
}) {
  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ── Mechanics ─────────────────────────────────────────────────────────────

export async function getNearbyMechanics(lat: number, lng: number, radius = 30) {
  const res = await fetch(`/api/mechanics/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  return res.json();
}

export async function getMechanicProfile() {
  const res = await fetch("/api/mechanic/profile");
  return res.json();
}

export async function updateMechanicLocation(data: {
  lat?: number;
  lng?: number;
  isAvailable?: boolean;
}) {
  const res = await fetch("/api/mechanic/location", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ── Service Requests ──────────────────────────────────────────────────────

export async function createServiceRequest(data: {
  mechanicId?: string;
  latitude: number;
  longitude: number;
  address?: string;
  vehicleType: string;
  vehicleModel?: string;
  issueDescription: string;
}) {
  const res = await fetch("/api/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getMyRequests() {
  const res = await fetch("/api/requests");
  return res.json();
}

export async function updateRequestStatus(id: string, status: string) {
  const res = await fetch(`/api/requests/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

// ── Reviews ───────────────────────────────────────────────────────────────

export async function submitReview(data: {
  serviceRequestId: string;
  mechanicId: string;
  rating: number;
  comment?: string;
}) {
  const res = await fetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ── Admin ─────────────────────────────────────────────────────────────────

export async function getAdminMechanics() {
  const res = await fetch("/api/admin/mechanics");
  return res.json();
}

export async function approveMechanic(mechanicId: string, approved: boolean) {
  const res = await fetch("/api/admin/mechanics", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mechanicId, isApproved: approved }),
  });
  return res.json();
}

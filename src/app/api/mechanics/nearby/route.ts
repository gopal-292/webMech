import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDistanceKm } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radius = parseFloat(searchParams.get("radius") || "30");

    const mechanics = await prisma.mechanic.findMany({
      where: {
        isApproved: true,
        isAvailable: true,
      },
      include: {
        user: {
          select: { id: true, name: true, phone: true },
        },
        reviewsReceived: {
          select: { rating: true },
        },
      },
    });

    // Filter by proximity using Haversine formula
    const nearby = mechanics
      .map((m) => {
        const distance = getDistanceKm(lat, lng, m.lat, m.lng);
        const avgRating =
          m.reviewsReceived.length > 0
            ? m.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / m.reviewsReceived.length
            : null;
        return { ...m, distance, avgRating };
      })
      .filter((m) => m.distance <= Math.max(radius, m.serviceRadius))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20);

    return NextResponse.json({ mechanics: nearby });
  } catch (error) {
    console.error("Nearby mechanics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

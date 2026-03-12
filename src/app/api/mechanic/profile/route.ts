import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET current mechanic's full profile
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "MECHANIC") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mechanicId = (session.user as any).mechanicId;

    const mechanic = await prisma.mechanic.findUnique({
      where: { id: mechanicId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        reviewsReceived: {
          select: { rating: true, comment: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!mechanic) {
      return NextResponse.json({ error: "Mechanic not found" }, { status: 404 });
    }

    const avgRating =
      mechanic.reviewsReceived.length > 0
        ? mechanic.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) /
          mechanic.reviewsReceived.length
        : null;

    return NextResponse.json({ mechanic: { ...mechanic, avgRating } });
  } catch (error) {
    console.error("Get mechanic profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH update mechanic profile info
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "MECHANIC") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mechanicId = (session.user as any).mechanicId;
    const { bio, specializations, vehicleTypes, serviceRadius } = await req.json();

    const updateData: any = {};
    if (bio !== undefined) updateData.bio = bio;
    if (specializations !== undefined) updateData.specializations = specializations;
    if (vehicleTypes !== undefined) updateData.vehicleTypes = vehicleTypes;
    if (serviceRadius !== undefined) updateData.serviceRadius = parseFloat(serviceRadius);

    const mechanic = await prisma.mechanic.update({
      where: { id: mechanicId },
      data: updateData,
    });

    return NextResponse.json({ success: true, mechanic });
  } catch (error) {
    console.error("Update mechanic profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Create a new service request
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { mechanicId, latitude, longitude, address, vehicleType, vehicleModel, issueDescription } = body;

    if (!latitude || !longitude || !vehicleType || !issueDescription) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const request = await prisma.serviceRequest.create({
      data: {
        userId: session.user.id!,
        mechanicId: mechanicId || null,
        latitude,
        longitude,
        address: address || "",
        vehicleType,
        vehicleModel: vehicleModel || "",
        issueDescription,
        status: mechanicId ? "PENDING" : "PENDING",
      },
    });

    return NextResponse.json({ success: true, request }, { status: 201 });
  } catch (error) {
    console.error("Create request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Get all requests for current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;

    if (role === "MECHANIC") {
      const mechanicId = (session.user as any).mechanicId;
      const requests = await prisma.serviceRequest.findMany({
        where: { mechanicId },
        include: {
          user: { select: { name: true, phone: true, email: true } },
          review: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ requests });
    }

    const requests = await prisma.serviceRequest.findMany({
      where: { userId: session.user.id! },
      include: {
        mechanic: {
          include: {
            user: { select: { name: true, phone: true } },
          },
        },
        review: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Get requests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

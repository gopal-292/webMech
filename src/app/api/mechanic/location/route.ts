import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "MECHANIC") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lat, lng, isAvailable } = await req.json();
    const mechanicId = (session.user as any).mechanicId;

    const updateData: any = {};
    if (lat !== undefined) updateData.lat = lat;
    if (lng !== undefined) updateData.lng = lng;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

    const mechanic = await prisma.mechanic.update({
      where: { id: mechanicId },
      data: updateData,
    });

    return NextResponse.json({ success: true, mechanic });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

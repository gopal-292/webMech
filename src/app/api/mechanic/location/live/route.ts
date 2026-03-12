import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Lightweight endpoint — mechanic client calls this every ~5 seconds with GPS coords
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "MECHANIC") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mechanicId = (session.user as any).mechanicId;
    if (!mechanicId) {
      return NextResponse.json({ error: "Mechanic not found" }, { status: 404 });
    }

    const { lat, lng } = await req.json();

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
    }

    await prisma.mechanic.update({
      where: { id: mechanicId },
      data: { lat, lng },
    });

    return NextResponse.json({ ok: true, lat, lng });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

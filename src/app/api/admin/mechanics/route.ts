import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Admin: list all mechanics (with approval filter)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const approved = searchParams.get("approved");

    const whereClause = approved !== null ? { isApproved: approved === "true" } : {};

    const mechanics = await prisma.mechanic.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
        reviewsReceived: { select: { rating: true } },
        _count: { select: { serviceRequests: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ mechanics });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Admin: approve or reject mechanic
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mechanicId, isApproved } = await req.json();

    const mechanic = await prisma.mechanic.update({
      where: { id: mechanicId },
      data: { isApproved },
    });

    return NextResponse.json({ success: true, mechanic });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

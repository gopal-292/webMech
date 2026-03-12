import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get pending requests near mechanic (for mechanic dashboard)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "MECHANIC") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mechanicId = (session.user as any).mechanicId;
    const mechanic = await prisma.mechanic.findUnique({ where: { id: mechanicId } });
    if (!mechanic) return NextResponse.json({ error: "Mechanic not found" }, { status: 404 });

    // Get pending requests (not yet assigned to any mechanic, or assigned to this mechanic)
    const requests = await prisma.serviceRequest.findMany({
      where: {
        status: { in: ["PENDING"] },
        mechanicId: null,
      },
      include: {
        user: { select: { name: true, phone: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests, mechanic });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

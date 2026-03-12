import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get single request
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const request = await prisma.serviceRequest.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { name: true, phone: true, email: true } },
        mechanic: {
          include: {
            user: { select: { name: true, phone: true } },
            reviewsReceived: { select: { rating: true } },
          },
        },
        review: true,
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ request });
  } catch (error) {
    console.error("Get request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Update request status (mechanic accepts/updates, user cancels)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, mechanicId } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (mechanicId) updateData.mechanicId = mechanicId;

    const request = await prisma.serviceRequest.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, request });
  } catch (error) {
    console.error("Update request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

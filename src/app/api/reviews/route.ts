import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { serviceRequestId, mechanicId, rating, comment } = await req.json();

    const existing = await prisma.review.findUnique({ where: { serviceRequestId } });
    if (existing) return NextResponse.json({ error: "Already reviewed" }, { status: 409 });

    const review = await prisma.review.create({
      data: {
        serviceRequestId,
        userId: session.user.id!,
        mechanicId,
        rating: Math.min(5, Math.max(1, rating)),
        comment: comment || "",
      },
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

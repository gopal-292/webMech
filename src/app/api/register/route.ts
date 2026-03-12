import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone, role, bio, specializations, vehicleTypes, serviceRadius } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: role === "MECHANIC" ? "MECHANIC" : "USER",
      },
    });

    if (role === "MECHANIC") {
      await prisma.mechanic.create({
        data: {
          userId: user.id,
          bio: bio || "",
          specializations: specializations || "General",
          vehicleTypes: vehicleTypes || "Car,Motorcycle,Truck",
          serviceRadius: parseFloat(serviceRadius) || 20,
          isApproved: false,
        },
      });
    }

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

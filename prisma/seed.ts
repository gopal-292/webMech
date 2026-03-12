import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean up
  await prisma.review.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.mechanic.deleteMany();
  await prisma.user.deleteMany();

  const hashPw = (pw: string) => bcrypt.hash(pw, 10);

  // ── Admin ──
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@webmech.com",
      password: await hashPw("admin123"),
      role: "ADMIN",
      phone: "+91 98000 00001",
    },
  });

  // ── Vehicle Owners ──
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Rahul Sharma",
        email: "user@demo.com",
        password: await hashPw("demo123"),
        phone: "+91 98765 11111",
        role: "USER",
      },
    }),
    prisma.user.create({
      data: {
        name: "Priya Patel",
        email: "priya@demo.com",
        password: await hashPw("demo123"),
        phone: "+91 98765 22222",
        role: "USER",
      },
    }),
  ]);

  // ── Mechanic Users ──
  const mechUsers = await Promise.all([
    prisma.user.create({
      data: {
        name: "Ravi Kumar",
        email: "mech@demo.com",
        password: await hashPw("demo123"),
        phone: "+91 91234 10001",
        role: "MECHANIC",
      },
    }),
    prisma.user.create({
      data: {
        name: "Suresh Nair",
        email: "suresh@demo.com",
        password: await hashPw("demo123"),
        phone: "+91 91234 10002",
        role: "MECHANIC",
      },
    }),
    prisma.user.create({
      data: {
        name: "Arun Menon",
        email: "arun@demo.com",
        password: await hashPw("demo123"),
        phone: "+91 91234 10003",
        role: "MECHANIC",
      },
    }),
  ]);

  // ── Mechanic Profiles (around Bangalore) ──
  const mechanics = await Promise.all([
    prisma.mechanic.create({
      data: {
        userId: mechUsers[0].id,
        bio: "10+ years experience in car and bike repair. Quick service guaranteed.",
        specializations: "Engine repair, Tyre change, Battery",
        vehicleTypes: "Car,Motorcycle,SUV",
        lat: 12.9716,
        lng: 77.5946,
        serviceRadius: 25,
        isApproved: true,
        isAvailable: true,
      },
    }),
    prisma.mechanic.create({
      data: {
        userId: mechUsers[1].id,
        bio: "Specialized in trucks and heavy vehicles. 24/7 availability.",
        specializations: "Towing, Engine, Electrical",
        vehicleTypes: "Truck,Bus,Van",
        lat: 12.9352,
        lng: 77.6245,
        serviceRadius: 30,
        isApproved: true,
        isAvailable: true,
      },
    }),
    prisma.mechanic.create({
      data: {
        userId: mechUsers[2].id,
        bio: "Electrical systems expert. Fast diagnostics with modern tools.",
        specializations: "Electrical, AC, Engine",
        vehicleTypes: "Car,SUV,Auto Rickshaw",
        lat: 12.9898,
        lng: 77.5505,
        serviceRadius: 20,
        isApproved: true,
        isAvailable: false,
      },
    }),
  ]);

  // ── Sample Service Requests ──
  const req1 = await prisma.serviceRequest.create({
    data: {
      userId: users[0].id,
      mechanicId: mechanics[0].id,
      status: "COMPLETED",
      latitude: 12.9616,
      longitude: 77.5855,
      address: "MG Road, Bangalore, Karnataka",
      vehicleType: "Car",
      vehicleModel: "Maruti Swift",
      issueDescription: "Engine won't start",
    },
  });

  await prisma.serviceRequest.create({
    data: {
      userId: users[1].id,
      mechanicId: mechanics[1].id,
      status: "ON_WAY",
      latitude: 12.9450,
      longitude: 77.6100,
      address: "Koramangala, Bangalore",
      vehicleType: "Truck",
      vehicleModel: "Tata 407",
      issueDescription: "Flat tyre",
    },
  });

  await prisma.serviceRequest.create({
    data: {
      userId: users[0].id,
      status: "PENDING",
      latitude: 12.9770,
      longitude: 77.5773,
      address: "Indiranagar, Bangalore",
      vehicleType: "Motorcycle",
      vehicleModel: "Honda Activa",
      issueDescription: "Battery dead",
    },
  });

  // ── Review for completed request ──
  await prisma.review.create({
    data: {
      serviceRequestId: req1.id,
      userId: users[0].id,
      mechanicId: mechanics[0].id,
      rating: 5,
      comment: "Excellent service! Ravi fixed my car in under 20 minutes. Highly recommended!",
    },
  });

  console.log("✅ Seed complete!");
  console.log("\n📋 Demo Accounts:");
  console.log("  Admin:    admin@webmech.com / admin123");
  console.log("  User:     user@demo.com / demo123");
  console.log("  Mechanic: mech@demo.com / demo123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

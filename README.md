# WebMech 🔧

> Roadside mechanic service on demand — connecting stranded vehicle owners with nearby professional mechanics.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat&logo=tailwind-css)

---

## Features

- 🚨 **Vehicle owners** report breakdowns with GPS location and describe the issue
- 🗺️ **Interactive map** shows nearby verified mechanics (Leaflet.js)
- 🔧 **Mechanics** accept jobs, update status, and share live location
- 🛡️ **Admin panel** approves/revokes mechanic registrations
- ⭐ **Review system** — rate mechanics after service
- 🔒 **Role-based auth** — USER, MECHANIC, ADMIN (NextAuth.js)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| ORM | Prisma + SQLite |
| Auth | NextAuth.js v5 |
| Maps | Leaflet.js (react-leaflet) |
| Data fetching | SWR |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up the database
npx prisma db push

# 3. Seed demo data
node prisma/seed.js

# 4. Start the development server
npm run dev
```

Visit **http://localhost:3000**

---

## Demo Accounts

| Role     | Email                 | Password  |
|----------|-----------------------|-----------|
| Admin    | admin@webmech.com     | admin123  |
| User     | user@demo.com         | demo123   |
| Mechanic | mech@demo.com         | demo123   |

---

## How It Works

```
1. Vehicle Owner signs up → reports breakdown (GPS + issue)
2. Map shows nearby approved mechanics
3. Owner picks a mechanic and sends a request
4. Mechanic accepts → updates status (On the Way → Arrived → Completed)
5. Owner tracks mechanic live on map
6. After completion, owner leaves a review
```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                     # Landing page
│   ├── login/                       # Login page
│   ├── signup/                      # Signup (User / Mechanic)
│   ├── dashboard/                   # User dashboard + request form + tracking
│   ├── mechanic/dashboard/          # Mechanic dashboard
│   ├── admin/                       # Admin panel
│   └── api/                         # REST API routes
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── RequestMap.tsx               # Leaflet map component
└── lib/
    ├── auth.ts                      # NextAuth configuration
    ├── prisma.ts                    # Prisma client singleton
    └── utils.ts                     # Helpers & constants
prisma/
├── schema.prisma                    # DB schema
└── seed.js                          # Demo data
```

---

## Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npx prisma db push` | Apply schema to database |
| `node prisma/seed.js` | Seed demo data |
| `npx prisma studio` | Open Prisma database GUI |

---

## License

MIT

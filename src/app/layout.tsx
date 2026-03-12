import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "WebMech — Roadside Mechanic on Demand",
  description:
    "Stuck on the road? Connect with nearby professional mechanics in minutes. WebMech brings help to you, wherever you are.",
  keywords: "mechanic, roadside assistance, car repair, breakdown help",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

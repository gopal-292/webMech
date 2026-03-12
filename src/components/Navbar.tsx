"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Wrench, LogOut, User, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = (session?.user as any)?.role;

  const dashboardLink =
    role === "MECHANIC" ? "/mechanic/dashboard" :
    role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-dark-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-white">
              Web<span className="text-brand-400">Mech</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/#how-it-works" className="text-dark-400 hover:text-white transition-colors text-sm">How it works</Link>
            <Link href="/#services" className="text-dark-400 hover:text-white transition-colors text-sm">Services</Link>
            {session ? (
              <div className="flex items-center gap-3">
                <Link href={dashboardLink} className="flex items-center gap-2 text-sm text-dark-300 hover:text-white transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 text-sm btn-secondary py-2 px-4"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="btn-secondary py-2 px-4 text-sm">Sign in</Link>
                <Link href="/signup" className="btn-primary py-2 px-4 text-sm">Get Help Now</Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-dark-300 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-dark-950/95 backdrop-blur-xl px-4 py-4 space-y-3">
          <Link href="/#how-it-works" className="block text-dark-300 hover:text-white py-2">How it works</Link>
          <Link href="/#services" className="block text-dark-300 hover:text-white py-2">Services</Link>
          {session ? (
            <>
              <Link href={dashboardLink} className="block text-dark-300 hover:text-white py-2">Dashboard</Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-secondary w-full text-sm">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary w-full text-center text-sm block">Sign in</Link>
              <Link href="/signup" className="btn-primary w-full text-center text-sm block">Get Help Now</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

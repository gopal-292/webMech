"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wrench, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      // Let middleware redirect based on role
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl text-white">Web<span className="text-brand-400">Mech</span></span>
          </Link>
          <h1 className="text-3xl font-bold text-white mt-4">Welcome back</h1>
          <p className="text-dark-400 mt-2">Sign in to your account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="label">Email address</label>
              <input
                id="email"
                type="email"
                required
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  required
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
                >
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in"}
            </button>
          </form>

          <p className="text-center text-dark-400 text-sm mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-brand-400 hover:text-brand-300 font-medium">
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 card p-4 text-sm text-dark-400">
          <p className="font-medium text-dark-300 mb-2">Demo credentials:</p>
          <div className="space-y-1">
            <p>Admin: <span className="text-brand-400">admin@webmech.com / admin123</span></p>
            <p>User: <span className="text-brand-400">user@demo.com / demo123</span></p>
            <p>Mechanic: <span className="text-brand-400">mech@demo.com / demo123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

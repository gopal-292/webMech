import Link from "next/link";
import { Wrench, MapPin, Clock, Shield, Star, ChevronRight, Car, Zap, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* HERO SECTION */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-16">
          {/* Background glows */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute -top-20 right-10 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl animate-pulse-slow animation-delay-400" />
            <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl animate-pulse-slow animation-delay-200" />
          </div>

          <div className="relative max-w-5xl mx-auto text-center z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-sm font-medium mb-8 animate-fade-in">
              <Zap className="w-4 h-4" />
              Roadside Help in Minutes
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 animate-slide-up">
              Stuck on the Road?{" "}
              <span className="gradient-text">Help is Minutes Away.</span>
            </h1>

            <p className="text-xl md:text-2xl text-dark-400 mb-10 max-w-3xl mx-auto animate-slide-up animation-delay-200">
              WebMech connects you with verified, professional mechanics near your exact location — anytime, anywhere.
            </p>

            <div className="flex flex-wrap gap-4 justify-center animate-slide-up animation-delay-400">
              <Link href="/signup" className="btn-primary text-lg px-8 py-4 shadow-2xl shadow-brand-500/30">
                Get Help Now
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link href="/signup?role=mechanic" className="btn-secondary text-lg px-8 py-4">
                <Wrench className="w-5 h-5" />
                Join as Mechanic
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 justify-center mt-16 animate-fade-in animation-delay-600">
              {[
                { label: "Registered Mechanics", value: "500+" },
                { label: "Cities Covered", value: "50+" },
                { label: "Avg Response Time", value: "<15 min" },
                { label: "Happy Customers", value: "10K+" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-dark-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="section-title mb-4">How It <span className="gradient-text">Works</span></h2>
              <p className="section-subtitle">Three simple steps to get back on the road</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  icon: MapPin,
                  title: "Report Your Location",
                  desc: "Tell us what happened and where you are. We auto-detect your GPS location — no need to type an address."
                },
                {
                  step: "02",
                  icon: Wrench,
                  title: "Pick a Mechanic",
                  desc: "View verified mechanics near you on a live map. See their ratings, specialties, and distance."
                },
                {
                  step: "03",
                  icon: Clock,
                  title: "Track & Get Help",
                  desc: "Watch your mechanic head toward you in real time. Get notified when they're close."
                }
              ].map((item) => (
                <div key={item.step} className="glass-card p-8 text-center group hover:bg-white/10 transition-all duration-300">
                  <div className="relative inline-block mb-6">
                    <div className="w-16 h-16 bg-brand-500/20 border border-brand-500/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="w-8 h-8 text-brand-400" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-brand-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-dark-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="py-24 px-4 bg-dark-900/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="section-title mb-4">Services We <span className="gradient-text">Cover</span></h2>
              <p className="section-subtitle">Our mechanics handle all kinds of roadside emergencies</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: "🔋", label: "Battery Jumpstart" },
                { icon: "🛞", label: "Tyre Change" },
                { icon: "⚙️", label: "Engine Repair" },
                { icon: "⛽", label: "Fuel Delivery" },
                { icon: "🔑", label: "Lockout Help" },
                { icon: "🌡️", label: "Overheating Fix" },
                { icon: "🚗", label: "Towing Service" },
                { icon: "🔧", label: "General Repair" },
              ].map((service) => (
                <div key={service.label} className="glass-card p-6 text-center hover:bg-white/10 transition-all duration-200 cursor-default group">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform inline-block">{service.icon}</div>
                  <p className="text-sm font-medium text-dark-200">{service.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TRUST / FEATURES */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="section-title mb-4">Why <span className="gradient-text">WebMech?</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Shield, title: "Verified Mechanics", desc: "Every mechanic is background-checked and approved by our admin team before they can accept jobs." },
                { icon: Star, title: "Rated & Reviewed", desc: "See real reviews from real customers. Pick the best-rated mechanic for your situation." },
                { icon: Phone, title: "Real-Time Tracking", desc: "Know exactly where your mechanic is at all times. No more waiting and wondering." },
              ].map((f) => (
                <div key={f.title} className="card p-8 hover:border-brand-500/40 transition-all duration-300 group">
                  <div className="w-12 h-12 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <f.icon className="w-6 h-6 text-brand-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-dark-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-orange-400 p-12 text-center">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
              <div className="relative z-10">
                <Car className="w-16 h-16 text-white/80 mx-auto mb-6" />
                <h2 className="text-4xl font-extrabold text-white mb-4">Broke Down? Don't Panic.</h2>
                <p className="text-white/80 text-xl mb-8">Sign up in 30 seconds and get help from a mechanic near you.</p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link href="/signup" className="bg-white text-brand-600 font-bold px-8 py-4 rounded-xl hover:bg-dark-100 transition-colors inline-flex items-center gap-2 text-lg">
                    Get Started Free
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                  <Link href="/login" className="bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/30 transition-colors inline-flex items-center gap-2 text-lg">
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

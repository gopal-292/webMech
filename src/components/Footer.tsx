import Link from "next/link";
import { Wrench, Twitter, Github, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-dark-950/80 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl text-white">Web<span className="text-brand-400">Mech</span></span>
            </div>
            <p className="text-dark-400 text-sm leading-relaxed max-w-xs">
              Connecting stranded vehicle owners with professional mechanics nearby. Fast, reliable, and always there when you need it most.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-dark-400">
              <li><Link href="/signup" className="hover:text-brand-400 transition-colors">Get Help</Link></li>
              <li><Link href="/signup?role=mechanic" className="hover:text-brand-400 transition-colors">Join as Mechanic</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-brand-400 transition-colors">How it Works</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-dark-400">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> help@webmech.com</li>
              <li>24/7 Support</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-dark-500 text-sm">
          © {new Date().getFullYear()} WebMech. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

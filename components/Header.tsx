"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 bg-white/85 backdrop-blur-xl border-b border-slate-200/60 z-50">
      <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-display font-extrabold text-lampam-navy hover:scale-[1.02] transition-transform">
          <div className="w-10 h-10 bg-gradient-to-br from-lampam-blue to-lampam-navy rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-lampam-blue/30">
            🐓
          </div>
          <div className="leading-tight">
            <div className="text-lg tracking-wide">LAMPAM</div>
            <div className="text-[10px] text-slate-500 font-medium tracking-widest">UZBEKISTAN</div>
          </div>
        </Link>

        <a
         href="tel:+998500249898"
          className="text-lampam-blue font-bold no-underline text-sm flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-blue-50 hover:bg-blue-100 hover:-translate-y-0.5 transition-all"
        >
          📞 <span className="hidden sm:inline">+998 50 024 98 98</span>
        </a>
      </div>
    </header>
  );
}

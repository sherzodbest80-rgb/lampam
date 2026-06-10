"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 px-5 pt-12 pb-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-10 pb-8 border-b border-slate-800">
          <div>
            <Link href="/" className="flex items-center gap-2.5 font-display font-extrabold text-white mb-3.5 no-underline">
              <div className="w-10 h-10 bg-gradient-to-br from-lampam-blue to-lampam-navy rounded-xl flex items-center justify-center text-2xl">
                🐓
              </div>
              <div className="leading-tight">
                <div className="text-lg tracking-wide">LAMPAM</div>
                <div className="text-[10px] text-slate-400 font-medium tracking-widest">UZBEKISTAN</div>
              </div>
            </Link>
            <p className="text-sm max-w-xs leading-relaxed">
              Thailand №1 xo'roz vitaminlari brendining O'zbekistondagi rasmiy importchisi.
            </p>
          </div>

          <div>
            <h4 className="text-white text-xs uppercase tracking-widest mb-4 font-bold">Sayt</h4>
            <Link href="/" className="block text-slate-400 no-underline text-sm py-1.5 hover:text-white transition-colors">Bosh sahifa</Link>
            <Link href="/#products" className="block text-slate-400 no-underline text-sm py-1.5 hover:text-white transition-colors">Mahsulotlar</Link>
            <Link href="/forma" className="block text-slate-400 no-underline text-sm py-1.5 hover:text-white transition-colors">Buyurtma</Link>
          </div>

          <div>
            <h4 className="text-white text-xs uppercase tracking-widest mb-4 font-bold">Aloqa</h4>
            <a href="tel:+998500249898" className="block text-slate-400 no-underline text-sm py-1.5 hover:text-white transition-colors">📞 +998 50 024 98 98</a>
            <a href="tel:+998500248880" className="block text-slate-400 no-underline text-sm py-1.5 hover:text-white transition-colors">📞 +998 50 024 88 80</a>
            <a href="#" className="block text-slate-400 no-underline text-sm py-1.5 hover:text-white transition-colors">📱 Telegram</a>
            <a href="#" className="block text-slate-400 no-underline text-sm py-1.5 hover:text-white transition-colors">📷 Instagram</a>
          </div>
        </div>

        <div className="text-center pt-6 text-xs">
          © 2026 LAMPAM Uzbekistan. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </footer>
  );
}

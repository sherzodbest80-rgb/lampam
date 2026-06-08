"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LeadForm() {
  const searchParams = useSearchParams();
  const productFromUrl = searchParams.get("product") || "";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [roosters, setRoosters] = useState("");
  const [problem, setProblem] = useState("");
  const [interestedProduct, setInterestedProduct] = useState(productFromUrl);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    let formatted = "+998 ";
    if (digits.length > 3) formatted += digits.slice(3, 5);
    if (digits.length > 5) formatted += " " + digits.slice(5, 8);
    if (digits.length > 8) formatted += " " + digits.slice(8, 10);
    if (digits.length > 10) formatted += " " + digits.slice(10, 12);
    return formatted.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const phoneDigits = phone.replace(/\D/g, "");

    if (name.trim().length < 2) {
      setStatus("error");
      setErrorMsg("Iltimos, ismingizni kiriting");
      return;
    }
    if (phoneDigits.length < 12) {
      setStatus("error");
      setErrorMsg("Iltimos, to'liq telefon raqamingizni kiriting");
      return;
    }

    // HOZIRCHA: faqat /thanks ga o'tkazadi
    // KEYIN: bu yerda AmoCRM + Meta CAPI + Telegram chaqiriladi
    setTimeout(() => {
      window.location.href = "/thanks";
    }, 500);
  };

  return (
    <main className="px-5 py-10 pb-16 relative overflow-hidden min-h-screen flex items-center justify-center">
      <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none animate-blob-move bg-[radial-gradient(circle,rgba(16,185,129,0.25)_0%,transparent_70%)]" />
      <div className="absolute -bottom-52 -left-40 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none animate-blob-move bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_70%)]" style={{ animationDelay: "-10s" }} />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center text-white mb-7">
          <div className="inline-flex items-center gap-2 bg-lampam-green/20 text-lampam-green-light px-4 py-2 rounded-full text-xs font-bold tracking-wider mb-4 border border-lampam-green/40 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-lampam-green-light rounded-full animate-pulse-dot" />
            🇹🇭 THAILAND ASLI MAHSULOTLAR
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold leading-tight mb-2.5 tracking-tight">
            Xo'rozingiz uchun <span className="bg-gradient-to-br from-lampam-green-light to-lampam-green bg-clip-text text-transparent">professional yechim</span>
          </h1>
          <p className="text-base opacity-90">Formani to'ldiring, biz tez orada bog'lanamiz</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-black/30">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-3.5 bg-gradient-to-br from-lampam-green to-emerald-600 rounded-2xl flex items-center justify-center text-2xl animate-pulse-phone">📋</div>
            <h2 className="font-display text-xl text-lampam-navy font-extrabold mb-1.5 tracking-tight">Buyurtma berish</h2>
            <p className="text-slate-500 text-sm">Bepul konsultatsiya oling</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-gradient-to-br from-blue-50 to-sky-50 border-l-4 border-lampam-blue rounded-lg p-3 mb-5 flex gap-2.5 items-start">
              <span className="text-lg flex-shrink-0">ℹ️</span>
              <p className="text-lampam-navy text-xs leading-relaxed m-0">
                Ushbu formani diqqat bilan to'ldiring va menejerlarimiz siz bilan bog'lanib ma'lumot berishadi
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-lampam-navy mb-2">Ismingiz</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: Akmal" disabled={status === "loading"} required className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 focus:outline-none focus:border-lampam-blue focus:bg-white focus:ring-4 focus:ring-lampam-blue/10 transition-all disabled:opacity-60" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-lampam-navy mb-2">Telefon raqamingiz</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} onFocus={() => !phone && setPhone("+998 ")} placeholder="+998 __ ___ __ __" disabled={status === "loading"} required className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 focus:outline-none focus:border-lampam-blue focus:bg-white focus:ring-4 focus:ring-lampam-blue/10 transition-all disabled:opacity-60" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-lampam-navy mb-2">Nechta xo'rozlaringiz bor?</label>
              <input type="text" value={roosters} onChange={(e) => setRoosters(e.target.value)} placeholder="Masalan: 5 ta, 20 ga yaqin, ko'p" disabled={status === "loading"} className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 focus:outline-none focus:border-lampam-blue focus:bg-white focus:ring-4 focus:ring-lampam-blue/10 transition-all disabled:opacity-60" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-lampam-navy mb-2">Nima muammo sizni qiynayapdi?</label>
              <textarea value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="Xo'rozingizning muammosini qisqacha yozing..." disabled={status === "loading"} className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 focus:outline-none focus:border-lampam-blue focus:bg-white focus:ring-4 focus:ring-lampam-blue/10 transition-all disabled:opacity-60 min-h-[80px] resize-y leading-relaxed" />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-bold text-lampam-navy mb-2">Qaysi mahsulotimiz qiziq bo'ldi?</label>
              <input type="text" value={interestedProduct} onChange={(e) => setInterestedProduct(e.target.value)} placeholder="Masalan: MEGA C 21, IBD 292 yoki bilmayman" disabled={status === "loading"} className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 focus:outline-none focus:border-lampam-blue focus:bg-white focus:ring-4 focus:ring-lampam-blue/10 transition-all disabled:opacity-60" />
            </div>

            {status === "error" && errorMsg && (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg mb-4">{errorMsg}</div>
            )}

            <button type="submit" disabled={status === "loading"} className="w-full bg-gradient-to-br from-lampam-blue to-lampam-navy text-white py-4 rounded-2xl font-bold text-base hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-lampam-blue/40 transition-all disabled:opacity-60">
              {status === "loading" ? "Yuborilmoqda..." : "So'rov yuborish →"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

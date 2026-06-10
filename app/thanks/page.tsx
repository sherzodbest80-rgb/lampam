"use client";

export default function ThanksPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-lampam-navy to-lampam-blue flex items-center justify-center p-5 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none animate-blob-move bg-[radial-gradient(circle,rgba(16,185,129,0.25)_0%,transparent_70%)]" />
      <div className="absolute -bottom-52 -left-40 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none animate-blob-move bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_70%)]" style={{ animationDelay: "-10s" }} />

      <div className="max-w-md w-full bg-white rounded-3xl px-9 pt-12 pb-10 shadow-2xl shadow-black/40 text-center relative z-10">
        {/* Checkmark */}
        <div className="w-24 h-24 mx-auto mb-6 animate-pulse-phone rounded-full">
          <svg viewBox="0 0 52 52" className="w-full h-full rounded-full bg-gradient-to-br from-lampam-green to-emerald-600 p-4 shadow-2xl shadow-lampam-green/40">
            <circle cx="26" cy="26" r="22" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "checkmarkCircle 0.8s 0.3s ease-out forwards" }} />
            <path d="M14 27 L22 35 L38 19" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="50" strokeDashoffset="50" style={{ animation: "checkmarkCheck 0.5s 1.1s ease-out forwards" }} />
          </svg>
        </div>

        <h1 className="font-display text-3xl text-lampam-navy font-extrabold mb-3 tracking-tight">Rahmat!</h1>
        <p className="text-slate-600 text-sm mb-7 leading-relaxed">
          So'rovingiz muvaffaqiyatli qabul qilindi. Menejerlarimiz tez orada siz bilan bog'lanib, xo'rozingiz uchun eng yaxshi yechimni taklif qilishadi.
        </p>

        <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-4 mb-6 border-l-4 border-lampam-blue text-left">
          <p className="text-lampam-navy text-sm leading-relaxed m-0">
            <strong>⚡ Tezroq javob olish uchun</strong><br />
            Hoziroq menejerimizga qo'ng'iroq qilishingiz mumkin
          </p>
        </div>

        <div>
          <span className="block text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">Menejer bilan bog'lanish</span>
          <a href="tel:+998500249898" className="flex items-center justify-center gap-3 bg-gradient-to-br from-lampam-green to-emerald-600 text-white py-4 px-7 rounded-2xl font-bold text-lg no-underline animate-pulse-phone hover:-translate-y-0.5 hover:scale-[1.02] transition-all">
            <span className="text-xl animate-shake">📞</span>
            <span className="font-display tracking-wide">+998 50 024 98 98</span>
          </a>
        </div>
      </div>
    </main>
  );
}

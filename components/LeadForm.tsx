"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { isValidUzMobile, PHONE_ERROR, prettyPhone } from "@/lib/phone";

// YORDAMCHI: Cookie'lardan fbp va fbc ni o'qish
function getFbCookies(): { fbp: string; fbc: string } {
  if (typeof document === "undefined") return { fbp: "", fbc: "" };

  const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
    const [key, value] = cookie.split("=");
    if (key && value) acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const fbp = cookies._fbp || "";

  let fbc = "";
  const urlParams = new URLSearchParams(window.location.search);
  const fbclidFromUrl = urlParams.get("fbclid");

  if (fbclidFromUrl) {
    fbc = `fb.1.${Date.now()}.${fbclidFromUrl}`;
  } else if (cookies._fbc) {
    fbc = cookies._fbc;
  }

  return { fbp, fbc };
}

// Qurilma ID: localStorage + cookie (bittasi tozalansa ikkinchisidan tiklanadi)
function getDeviceId(): string {
  try {
    const fromCookie = document.cookie.match(/(?:^|;\s*)roost_did=([^;]+)/)?.[1] || "";
    let id = localStorage.getItem("roost_did") || fromCookie;
    if (!id) {
      id = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    }
    localStorage.setItem("roost_did", id);
    document.cookie = `roost_did=${id}; path=/; max-age=31536000; SameSite=Lax`;
    return id;
  } catch {
    return "";
  }
}

// Kirish manbasi: utm_*, fbclid, referrer — sessiyadagi birinchi sahifadan
function getAttribution(): { utm: Record<string, string>; fbclid: boolean; referrer: string; landingUrl: string } {
  const current = new URLSearchParams(window.location.search);
  const utmNow: Record<string, string> = {};
  current.forEach((v, k) => {
    if (k.startsWith("utm_") && v) utmNow[k] = v;
  });
  let saved: any = null;
  try {
    saved = JSON.parse(sessionStorage.getItem("roost_attr") || "null");
  } catch {}
  return {
    utm: Object.keys(utmNow).length ? utmNow : saved?.utm || {},
    fbclid: current.has("fbclid") || !!saved?.fbclid,
    referrer: saved?.referrer ?? document.referrer,
    landingUrl: saved?.landingUrl || window.location.href,
  };
}

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot — odamga ko'rinmaydi

  const mountedAtRef = useRef<number>(Date.now());
  const elapsedRef = useRef<number>(0);
  const deviceIdRef = useRef<string>("");

  // fbp/fbc ni oldindan ushlab qo'yish uchun ref
  const cachedFbpRef = useRef<string>("");
  const cachedFbcRef = useRef<string>("");

  // Sahifa ochilgach Pixel cookie qo'yishini kutamiz va ushlaymiz (4x try)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const tryCapture = () => {
      const { fbp, fbc } = getFbCookies();
      if (fbp && !cachedFbpRef.current) cachedFbpRef.current = fbp;
      if (fbc && !cachedFbcRef.current) cachedFbcRef.current = fbc;
    };

    tryCapture();
    mountedAtRef.current = Date.now();
    deviceIdRef.current = getDeviceId();

    const timer1 = setTimeout(tryCapture, 500);
    const timer2 = setTimeout(tryCapture, 1500);
    const timer3 = setTimeout(tryCapture, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const formatPhone = (value: string): string => {
    let digits = value.replace(/\D/g, "");
    // Avtoto'ldirish/qo'yish "+998 " ustiga to'liq raqam qo'shsa, 998 ikki marta bo'lib qoladi
    if (digits.startsWith("998998") && digits.length > 12) digits = digits.slice(3);
    // "901234567" ko'rinishida qo'yilgan raqam
    else if (digits.length === 9 && !digits.startsWith("998")) digits = "998" + digits;
    let formatted = "+998 ";
    if (digits.length > 3) formatted += digits.slice(3, 5);
    if (digits.length > 5) formatted += " " + digits.slice(5, 8);
    if (digits.length > 8) formatted += " " + digits.slice(8, 10);
    if (digits.length > 10) formatted += " " + digits.slice(10, 12);
    return formatted.trim();
  };

  // 1-bosqich: tekshiramiz va "Raqamingiz to'g'rimi?" oynasini ochamiz
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (name.trim().length < 2) {
      setStatus("error");
      setErrorMsg("Iltimos, ismingizni kiriting");
      return;
    }
    if (!isValidUzMobile(phone)) {
      setStatus("error");
      setErrorMsg(PHONE_ERROR);
      return;
    }

    elapsedRef.current = Date.now() - mountedAtRef.current;
    setStatus("idle");
    setConfirmOpen(true);
  };

  // 2-bosqich: mijoz raqamni tasdiqladi — yuboramiz
  const sendLead = async () => {
    setConfirmOpen(false);
    setStatus("loading");
    setErrorMsg("");

    const phoneDigits = phone.replace(/\D/g, "");

    try {
      // Submit paytida yana cookie o'qiymiz (cache bilan birga eng ishonchli qiymat)
      const { fbp: fbpNow, fbc: fbcNow } = getFbCookies();
      const finalFbp = fbpNow || cachedFbpRef.current || "";
      const finalFbc = fbcNow || cachedFbcRef.current || "";

      const eventId = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: "+" + phoneDigits,
          roosters: roosters.trim(),
          problem: problem.trim(),
          interestedProduct: interestedProduct.trim(),
          source: "roost.uz",
          fbp: finalFbp,
          fbc: finalFbc,
          userAgent: navigator.userAgent,
          pageUrl: window.location.href,
          event_id: eventId,
          deviceId: deviceIdRef.current,
          website,
          elapsedMs: elapsedRef.current,
          attribution: getAttribution(),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Xatolik yuz berdi");
      }

      // Pixel'ga Lead eventi faqat server "haqiqiy lid" desa (shubhali/takroriy emas).
      // Server CAPI bilan bir xil event_id — deduplikatsiya.
      if (data.track && typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Lead", {}, { eventID: eventId });
        await new Promise((r) => setTimeout(r, 300)); // pixel so'rovi ketib ulgursin
      }

      // Muvaffaqiyatli yuborildi — /thanks ga o'tkazamiz
      window.location.href = "/thanks";
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Xatolik yuz berdi. Qaytadan urinib ko'ring");
    }
  };

  return (
    <main className="px-5 py-10 pb-16 relative overflow-hidden min-h-screen flex items-center justify-center">
      <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none animate-blob-move bg-[radial-gradient(circle,rgba(16,185,129,0.25)_0%,transparent_70%)]" />
      <div className="absolute -bottom-52 -left-40 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none animate-blob-move bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_70%)]" style={{ animationDelay: "-10s" }} />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center text-white mb-7">
          <div className="inline-flex items-center gap-2 bg-lampam-green/20 text-lampam-green-light px-4 py-2 rounded-full text-xs font-bold tracking-wider mb-4 border border-lampam-green/40 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-lampam-green-light rounded-full animate-pulse-dot" />
            ASLI MAHSULOTLAR
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold leading-tight mb-2.5 tracking-tight">
            Xo&apos;rozingiz uchun <span className="bg-gradient-to-br from-lampam-green-light to-lampam-green bg-clip-text text-transparent">professional yechim</span>
          </h1>
          <p className="text-base opacity-90">Formani to&apos;ldiring, biz tez orada bog&apos;lanamiz</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-black/30">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-3.5 bg-gradient-to-br from-lampam-green to-emerald-600 rounded-2xl flex items-center justify-center text-2xl animate-pulse-phone">📋</div>
            <h2 className="font-display text-xl text-lampam-navy font-extrabold mb-1.5 tracking-tight">Buyurtma berish</h2>
            <p className="text-slate-500 text-sm">Bepul konsultatsiya oling</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Honeypot: odam ko'rmaydi, bot to'ldiradi */}
            <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
              <label>
                Veb-sayt
                <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </label>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-sky-50 border-l-4 border-lampam-blue rounded-lg p-3 mb-5 flex gap-2.5 items-start">
              <span className="text-lg flex-shrink-0">ℹ️</span>
              <p className="text-lampam-navy text-xs leading-relaxed m-0">
                Ushbu formani diqqat bilan to&apos;ldiring va menejerlarimiz siz bilan bog&apos;lanib ma&apos;lumot berishadi
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
              <label className="block text-sm font-bold text-lampam-navy mb-2">Nechta xo&apos;rozlaringiz bor?</label>
              <input type="text" value={roosters} onChange={(e) => setRoosters(e.target.value)} placeholder="Masalan: 5 ta, 20 ga yaqin, ko'p" disabled={status === "loading"} className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 focus:outline-none focus:border-lampam-blue focus:bg-white focus:ring-4 focus:ring-lampam-blue/10 transition-all disabled:opacity-60" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-lampam-navy mb-2">Nima muammo sizni qiynayapdi?</label>
              <textarea value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="Xo'rozingizning muammosini qisqacha yozing..." disabled={status === "loading"} className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 focus:outline-none focus:border-lampam-blue focus:bg-white focus:ring-4 focus:ring-lampam-blue/10 transition-all disabled:opacity-60 min-h-[80px] resize-y leading-relaxed" />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-bold text-lampam-navy mb-2">Qaysi mahsulotimiz qiziq bo&apos;ldi?</label>
              <input type="text" value={interestedProduct} onChange={(e) => setInterestedProduct(e.target.value)} placeholder="Masalan: MAX C 21, ABD 292 yoki bilmayman" disabled={status === "loading"} className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 focus:outline-none focus:border-lampam-blue focus:bg-white focus:ring-4 focus:ring-lampam-blue/10 transition-all disabled:opacity-60" />
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

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="w-full max-w-sm bg-white rounded-3xl p-7 shadow-2xl text-center">
            <h3 id="confirm-title" className="font-display text-xl text-lampam-navy font-extrabold mb-4 tracking-tight">Raqamingiz to&apos;g&apos;rimi?</h3>
            <div className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-wide mb-6 whitespace-nowrap">{prettyPhone(phone)}</div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setConfirmOpen(false)} className="flex-1 py-3.5 rounded-2xl font-bold text-base border-2 border-slate-200 text-lampam-navy bg-white hover:bg-slate-50 transition-all">
                O&apos;zgartirish
              </button>
              <button type="button" onClick={sendLead} autoFocus className="flex-1 py-3.5 rounded-2xl font-bold text-base text-white bg-gradient-to-br from-lampam-green to-emerald-600 hover:-translate-y-0.5 transition-all">
                To&apos;g&apos;ri
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

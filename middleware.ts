import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";

// Chet eldan kirgan tashrifni darhol xabar qilish (Quvondiq, 02.10.2026).
// Sabab: raqobatchi saytni Tailandda ko'rsatgani aniqlangan, lekin saytda hech qanday
// hisoblagich bo'lmagani uchun tashrif vaqtini orqaga qarab aniqlash imkoni yo'q edi.
// Bu middleware O'zbekistondan tashqari har bir tashrifni n8n webhookiga yuboradi,
// n8n esa Telegramga vaqti, mamlakati, shahri, IP va qurilmasi bilan yozadi.
//
// Qoidalar:
// - Hech qachon sahifa ochilishini to'xtatmaydi (xato bo'lsa jim o'tadi).
// - Bir xil odam har sahifada qayta xabar bermasligi uchun 6 soatlik cookie qo'yiladi.
// - O'zbekistondan kirganlar xabar qilinmaydi (kunda minglab tashrif bor).
// - `?vtest=1` bilan majburan test xabari yuboriladi (tekshirish uchun).

const UY_MAMLAKAT = "UZ";
const COOKIE = "vq";
const COOKIE_MUDDATI = 6 * 60 * 60; // 6 soat

export function middleware(req: NextRequest, event: NextFetchEvent) {
  const res = NextResponse.next();
  try {
    const webhook = process.env.VISIT_WEBHOOK_URL;
    if (!webhook) return res;

    const test = req.nextUrl.searchParams.get("vtest") === "1";
    const country = (req.headers.get("x-vercel-ip-country") || "").toUpperCase();

    // O'zbekiston yoki aniqlanmagan mamlakat — xabar qilinmaydi (test bundan mustasno)
    if (!test && (!country || country === UY_MAMLAKAT)) return res;

    // Yaqinda xabar berilgan bo'lsa takrorlamaymiz
    if (!test && req.cookies.get(COOKIE)) return res;

    const payload = {
      country,
      city: decodeURIComponent(req.headers.get("x-vercel-ip-city") || ""),
      region: req.headers.get("x-vercel-ip-country-region") || "",
      ip:
        req.headers.get("x-real-ip") ||
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "",
      path: req.nextUrl.pathname + (req.nextUrl.search || ""),
      host: req.headers.get("host") || "",
      referer: req.headers.get("referer") || "",
      ua: req.headers.get("user-agent") || "",
      test,
    };

    event.waitUntil(
      fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => undefined)
    );

    res.cookies.set(COOKIE, "1", { maxAge: COOKIE_MUDDATI, httpOnly: true, sameSite: "lax" });
  } catch {
    // Jim o'tamiz — sayt ishlashi hech qachon buzilmasligi kerak
  }
  return res;
}

// Faqat odam ko'radigan sahifalar; statik fayllar, rasm va API chaqiriqlari hisoblanmaydi
export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|txt|xml|woff|woff2)$).*)"],
};

import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface LeadData {
  name: string;
  phone: string;
  roosters: string;
  problem: string;
  interestedProduct: string;
  source?: string;
}

// HTML maxsus belgilarini xavfsiz qiladi (< > & buzilmasligi uchun)
function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(req: Request) {
  try {
    const body: LeadData = await req.json();
    const { name, phone, roosters, problem, interestedProduct, source } = body;

    // --- Validatsiya ---
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Ism kiritilmagan" }, { status: 400 });
    }
    if (!phone || phone.replace(/\D/g, "").length < 12) {
      return NextResponse.json({ error: "Telefon raqami noto'g'ri" }, { status: 400 });
    }

    // --- Env variables ---
    // .trim() — Vercel'ga nusxalashda kirib qolgan bo'sh joy/yangi qatorni olib tashlaydi
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const GROUP_ID = process.env.TELEGRAM_GROUP_ID?.trim();

    if (!BOT_TOKEN || !GROUP_ID) {
      return NextResponse.json({ error: "Server konfiguratsiya xatosi (env yo'q)" }, { status: 500 });
    }

    // --- Telegram xabar matni (barcha maydonlar escape qilingan) ---
    const text = [
      "🐓 <b>Yangi LAMPAM lid!</b>",
      "",
      `👤 <b>Ism:</b> ${escapeHtml(name)}`,
      `📞 <b>Telefon:</b> ${escapeHtml(phone)}`,
      `🐔 <b>Nechta xo'roz:</b> ${escapeHtml(roosters || "—")}`,
      `❓ <b>Muammo:</b> ${escapeHtml(problem || "—")}`,
      `📦 <b>Qiziqqan mahsulot:</b> ${escapeHtml(interestedProduct || "—")}`,
      `🌐 <b>Manba:</b> ${escapeHtml(source || "lampam-uzbekistan.uz")}`,
    ].join("\n");

    // --- Telegram'ga yuborish ---
    const tgResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: GROUP_ID,
          text,
          parse_mode: "HTML",
        }),
      }
    );

    // --- MUHIM: Telegram xatosini YASHIRMAYMIZ ---
    const tgResult = await tgResponse.json();

    if (!tgResponse.ok || !tgResult.ok) {
      // Aniq xatoni Vercel logiga ham yozamiz
      console.error("TELEGRAM XATO:", JSON.stringify(tgResult));
      // VA brauzerga ham qaytaramiz — Network → Response'da ko'rinadi
      return NextResponse.json(
        {
          error: "Telegram'ga yuborilmadi",
          telegram_error_code: tgResult.error_code,
          telegram_description: tgResult.description,
        },
        { status: 502 }
      );
    }

    // Hammasi joyida
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SERVER XATO:", err);
    return NextResponse.json(
      { error: "Server xatosi", detail: String(err) },
      { status: 500 }
    );
  }
}
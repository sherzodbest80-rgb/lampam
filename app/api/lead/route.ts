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

export async function POST(req: Request) {
  try {
    const body: LeadData = await req.json();
    const { name, phone, roosters, problem, interestedProduct, source } = body;

    // Validatsiya
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Ism kiritilmagan" }, { status: 400 });
    }
    if (!phone || phone.replace(/\D/g, "").length < 12) {
      return NextResponse.json({ error: "Telefon raqami noto'g'ri" }, { status: 400 });
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const GROUP_ID = process.env.TELEGRAM_GROUP_ID;

    if (!BOT_TOKEN || !GROUP_ID) {
      console.error("Telegram credentials not set");
      return NextResponse.json({ error: "Server konfiguratsiya xatosi" }, { status: 500 });
    }

    // Telegram xabar matni
    const now = new Date();
    const dateStr = now.toLocaleString("uz-UZ", {
      timeZone: "Asia/Tashkent",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const text = [
      "🔔 <b>Yangi lid - LAMPAM Uzbekistan</b>",
      "",
      `👤 <b>Ism:</b> ${escapeHtml(name)}`,
      `📞 <b>Telefon:</b> ${escapeHtml(phone)}`,
      roosters ? `🐓 <b>Xo'rozlar:</b> ${escapeHtml(roosters)}` : "",
      problem ? `❗ <b>Muammo:</b> ${escapeHtml(problem)}` : "",
      interestedProduct ? `💊 <b>Qiziqdi:</b> ${escapeHtml(interestedProduct)}` : "",
      "",
      `🌐 <b>Manba:</b> ${source || "lampam-uzbekistan.uz"}`,
      `⏰ ${dateStr}`,
    ]
      .filter(Boolean)
      .join("\n");

    // Telegram API ga yuborish
    const tgUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const tgResponse = await fetch(tgUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: GROUP_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!tgResponse.ok) {
      const errData = await tgResponse.text();
      console.error("Telegram error:", errData);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Lead API error:", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
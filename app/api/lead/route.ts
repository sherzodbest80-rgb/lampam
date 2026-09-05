import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

interface LeadData {
  name: string;
  phone: string;
  roosters?: string;
  problem?: string;
  interestedProduct?: string;
  source?: string;
  // Meta match uchun (brauzerdan keladi)
  fbp?: string;
  fbc?: string;
  userAgent?: string;
  pageUrl?: string;
  event_id?: string; // Pixel bilan deduplikatsiya
}

// HTML maxsus belgilarini xavfsiz qiladi
function escapeHtml(text: string): string {
  if (!text) return "";
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function POST(req: Request) {
  try {
    const body: LeadData = await req.json();
    const {
      name,
      phone,
      roosters,
      problem,
      interestedProduct,
      source,
      fbp,
      fbc,
      userAgent,
      pageUrl,
      event_id,
    } = body;

    // --- Validatsiya ---
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Ism kiritilmagan" }, { status: 400 });
    }
    if (!phone || phone.replace(/\D/g, "").length < 12) {
      return NextResponse.json({ error: "Telefon raqami noto'g'ri" }, { status: 400 });
    }

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    // Izoh matnini yig'amiz
    const commentParts: string[] = [];
    if (roosters) commentParts.push(`🐔 Nechta xo'roz: ${roosters}`);
    if (problem) commentParts.push(`❓ Muammo: ${problem}`);
    if (interestedProduct) commentParts.push(`📦 Qiziqqan mahsulot: ${interestedProduct}`);
    commentParts.push(`🔗 Manba: ${source || "roost.uz"}`);
    const comment = commentParts.join("\n");

    // 1-QADAM: amoCRM
    let amoResult: any = null;
    try {
      amoResult = await createAmoCRMLead({
        name: name.trim(),
        phone: phone.trim(),
        comment,
        fbp,
        fbc,
        clientIp,
        userAgent: userAgent || "",
      });
    } catch (amoErr: any) {
      console.error("[AMOCRM XATO]", amoErr.message);
      amoResult = { error: amoErr.message };
    }

    // 2-QADAM: Meta CAPI (Lead)
    let metaResult: any = null;
    try {
      metaResult = await sendToMetaCAPI({
        name: name.trim(),
        phone: phone.trim(),
        fbp,
        fbc,
        clientIp,
        userAgent: userAgent || "",
        pageUrl: pageUrl || process.env.NEXT_PUBLIC_SITE_URL || "",
        contactId: amoResult?.contactId ? String(amoResult.contactId) : "",
        leadId: amoResult?.leadId ? String(amoResult.leadId) : "",
        eventId: event_id,
      });
    } catch (metaErr: any) {
      console.error("[META XATO]", metaErr.message);
      metaResult = { error: metaErr.message };
    }

    // 3-QADAM: Telegram
    try {
      await sendToTelegram({
        name: name.trim(),
        phone: phone.trim(),
        roosters,
        problem,
        interestedProduct,
        source: source || "roost.uz",
        amoLeadId: amoResult?.leadId,
      });
    } catch (tgErr: any) {
      console.error("[TELEGRAM XATO]", tgErr.message);
    }

    if (amoResult?.error && metaResult?.error) {
      return NextResponse.json(
        { error: "Xizmat vaqtincha ishlamayapti, iltimos qayta urining" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[LEAD API ERROR]", err);
    return NextResponse.json({ error: err.message || "Server xatosi" }, { status: 500 });
  }
}

// ---------------- Telegram ----------------
async function sendToTelegram(data: {
  name: string;
  phone: string;
  roosters?: string;
  problem?: string;
  interestedProduct?: string;
  source: string;
  amoLeadId?: number;
}) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
  // Massajor bilan bir xil nom (TELEGRAM_CHAT_ID) yoki eski TELEGRAM_GROUP_ID
  const CHAT_ID =
    process.env.TELEGRAM_CHAT_ID?.trim() || process.env.TELEGRAM_GROUP_ID?.trim();

  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn("[TELEGRAM] credentials yo'q, o'tkazib yuborildi");
    return { skipped: true };
  }

  const lines: string[] = [
    "🐓 <b>Yangi ROOST lid!</b>",
    "",
    `👤 <b>Ism:</b> ${escapeHtml(data.name)}`,
    `📞 <b>Telefon:</b> ${escapeHtml(data.phone)}`,
  ];
  if (data.roosters) lines.push(`🐔 <b>Nechta xo'roz:</b> ${escapeHtml(data.roosters)}`);
  if (data.problem) lines.push(`❓ <b>Muammo:</b> ${escapeHtml(data.problem)}`);
  if (data.interestedProduct)
    lines.push(`📦 <b>Mahsulot:</b> ${escapeHtml(data.interestedProduct)}`);
  lines.push("");
  lines.push(`🌐 <b>Manba:</b> ${escapeHtml(data.source)}`);
  if (data.amoLeadId) lines.push(`🆔 <b>AmoCRM ID:</b> ${data.amoLeadId}`);

  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: lines.join("\n"),
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
  const result = await res.json();
  if (!res.ok || !result.ok) {
    console.error("[TELEGRAM ERROR]", result);
    throw new Error(`Telegram xatosi: ${result.description || "unknown"}`);
  }
  return result;
}

// ---------------- Meta CAPI (Lead) ----------------
async function sendToMetaCAPI(data: {
  name: string;
  phone: string;
  fbp?: string;
  fbc?: string;
  clientIp: string;
  userAgent: string;
  pageUrl: string;
  contactId: string;
  leadId: string;
  eventId?: string;
}) {
  const PIXEL_ID = process.env.META_PIXEL_ID;
  const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn("[META CAPI] credentials yo'q, o'tkazib yuborildi");
    return { skipped: true };
  }

  const hash = (v: string) =>
    crypto.createHash("sha256").update(v.toLowerCase().trim()).digest("hex");
  const normalizedPhone = data.phone.replace(/[\s\-\(\)\+]/g, "");
  const nameParts = data.name.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ");

  const userData: Record<string, any> = {
    ph: [hash(normalizedPhone)],
    client_ip_address: data.clientIp,
    client_user_agent: data.userAgent,
    country: [hash("uz")],
  };
  if (firstName) userData.fn = [hash(firstName)];
  if (lastName) userData.ln = [hash(lastName)];
  if (data.contactId) userData.external_id = [hash(data.contactId)];
  if (data.fbp) userData.fbp = data.fbp;
  if (data.fbc) userData.fbc = data.fbc;

  const finalEventId =
    data.eventId || (data.leadId ? `lead_${data.leadId}` : `lead_${Date.now()}`);

  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: finalEventId,
        event_source_url: data.pageUrl,
        action_source: "website",
        user_data: userData,
      },
    ],
    ...(process.env.META_TEST_EVENT_CODE
      ? { test_event_code: process.env.META_TEST_EVENT_CODE }
      : {}),
  };

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  const result = await res.json();
  if (!res.ok) {
    console.error("[META CAPI ERROR]", result);
    return { error: result };
  }
  return result;
}

// ---------------- amoCRM (Website lead) ----------------
async function createAmoCRMLead(data: {
  name: string;
  phone: string;
  comment: string;
  fbp?: string;
  fbc?: string;
  clientIp?: string;
  userAgent?: string;
}) {
  const DOMAIN = process.env.AMOCRM_DOMAIN;
  const ACCESS_TOKEN = process.env.AMOCRM_ACCESS_TOKEN;
  const FIELD_FBP = process.env.AMOCRM_FIELD_FBP;
  const FIELD_FBC = process.env.AMOCRM_FIELD_FBC;
  const FIELD_IP = process.env.AMOCRM_FIELD_IP;
  const FIELD_USER_AGENT = process.env.AMOCRM_FIELD_USER_AGENT;
  const PIPELINE_ID = process.env.AMOCRM_PIPELINE_ID
    ? parseInt(process.env.AMOCRM_PIPELINE_ID)
    : null;

  if (!DOMAIN || !ACCESS_TOKEN) {
    console.warn("[AMOCRM] credentials yo'q, o'tkazib yuborildi");
    return { skipped: true };
  }

  const baseUrl = `https://${DOMAIN}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  };

  const contactCustomFields: any[] = [
    { field_code: "PHONE", values: [{ value: data.phone, enum_code: "WORK" }] },
  ];

  const leadCustomFields: any[] = [];
  if (FIELD_FBP && data.fbp)
    leadCustomFields.push({ field_id: parseInt(FIELD_FBP), values: [{ value: data.fbp }] });
  if (FIELD_FBC && data.fbc)
    leadCustomFields.push({ field_id: parseInt(FIELD_FBC), values: [{ value: data.fbc }] });
  if (FIELD_IP && data.clientIp)
    leadCustomFields.push({ field_id: parseInt(FIELD_IP), values: [{ value: data.clientIp }] });
  if (FIELD_USER_AGENT && data.userAgent)
    leadCustomFields.push({
      field_id: parseInt(FIELD_USER_AGENT),
      values: [{ value: data.userAgent }],
    });

  const unsortedPayload = [
    {
      source_name: "Roost Website",
      source_uid: `roost_web_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...(PIPELINE_ID ? { pipeline_id: PIPELINE_ID } : {}),
      metadata: {
        form_id: "roost_website_form",
        form_name: "Roost Website Lead Form",
        form_page: process.env.NEXT_PUBLIC_SITE_URL || "https://roost.uz",
        ip: data.clientIp || "127.0.0.1",
        form_sent_at: Math.floor(Date.now() / 1000),
        referer: process.env.NEXT_PUBLIC_SITE_URL || "https://roost.uz",
      },
      _embedded: {
        leads: [
          {
            name: `${data.name} - ${data.phone}`,
            ...(PIPELINE_ID ? { pipeline_id: PIPELINE_ID } : {}),
            ...(leadCustomFields.length > 0
              ? { custom_fields_values: leadCustomFields }
              : {}),
          },
        ],
        contacts: [{ name: data.name, custom_fields_values: contactCustomFields }],
      },
    },
  ];

  const unsortedRes = await fetch(`${baseUrl}/api/v4/leads/unsorted/forms`, {
    method: "POST",
    headers,
    body: JSON.stringify(unsortedPayload),
  });
  const unsortedData = await unsortedRes.json();
  if (!unsortedRes.ok) {
    console.error("[AMOCRM UNSORTED XATOLIK]", JSON.stringify(unsortedData));
    throw new Error("AmoCRM Неразобранное ga lid yaratishda xatolik");
  }

  const unsortedItem = unsortedData?._embedded?.unsorted?.[0];
  const leadId = unsortedItem?._embedded?.leads?.[0]?.id;
  const contactId = unsortedItem?._embedded?.contacts?.[0]?.id;

  if (leadId && data.comment) {
    try {
      const noteText = [`Mijoz: ${data.name}`, `Telefon: ${data.phone}`, `\n${data.comment}`]
        .filter(Boolean)
        .join("\n");
      await fetch(`${baseUrl}/api/v4/leads/${leadId}/notes`, {
        method: "POST",
        headers,
        body: JSON.stringify([{ note_type: "common", params: { text: noteText } }]),
      });
    } catch (err) {
      console.warn("[AMOCRM] Izoh qo'shishda xatolik:", err);
    }
  }

  return { leadId, contactId };
}

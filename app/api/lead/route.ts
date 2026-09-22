import { NextResponse } from "next/server";
import crypto from "crypto";
import { findRecentLeadByPhone } from "@/lib/amocrm-dedup";
import { isValidUzMobile, maskPhone, PHONE_ERROR } from "@/lib/phone";
import {
  checkDevice,
  cleanDeviceId,
  ipUaHash,
  releaseLock,
  rememberDevice,
} from "@/lib/lead-guard";

export const runtime = "nodejs";

// Forma sahifa ochilgandan shuncha vaqtdan tez yuborilsa — shubhali
const MIN_FILL_MS = 3000;

interface Attribution {
  utm?: Record<string, string>;
  fbclid?: boolean;
  referrer?: string;
  landingUrl?: string;
}

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
  // Himoya
  deviceId?: string;
  website?: string; // honeypot — odam uni ko'rmaydi, bot to'ldiradi
  elapsedMs?: number;
  attribution?: Attribution;
}

// HTML maxsus belgilarini xavfsiz qiladi
function escapeHtml(text: string): string {
  if (!text) return "";
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function clip(v: unknown, max = 300): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function readCookie(req: Request, name: string): string {
  const m = (req.headers.get("cookie") || "").match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : "";
}

// amoCRM izohi uchun manba ma'lumoti
function buildSourceInfo(d: {
  attribution?: Attribution;
  fbp?: string;
  fbc?: string;
  pageUrl: string;
  userAgent: string;
  clientIp: string;
  elapsedMs: number | null;
}): string {
  const a = d.attribution || {};
  const lines = ["📊 Manba ma'lumoti:"];
  lines.push(`fbclid: ${a.fbclid ? "bor" : "yo'q"}`);
  lines.push(`fbc: ${d.fbc ? "bor" : "yo'q"} | fbp: ${d.fbp ? "bor" : "yo'q"}`);
  const utm = Object.entries(a.utm || {})
    .filter(([k, v]) => /^utm_[a-z_]{2,20}$/.test(k) && typeof v === "string" && v)
    .slice(0, 8)
    .map(([k, v]) => `${k}=${clip(v, 150)}`);
  if (utm.length) lines.push(`UTM: ${utm.join(", ")}`);
  lines.push(`Referrer: ${clip(a.referrer, 300) || "yo'q"}`);
  lines.push(`Sahifa: ${clip(d.pageUrl, 400) || "noma'lum"}`);
  const landing = clip(a.landingUrl, 400);
  if (landing && landing !== clip(d.pageUrl, 400)) lines.push(`Kirish sahifasi: ${landing}`);
  lines.push(`User-Agent: ${clip(d.userAgent, 300) || "noma'lum"}`);
  lines.push(`IP: ${d.clientIp}`);
  lines.push(
    `Forma to'ldirish vaqti: ${d.elapsedMs === null ? "noma'lum" : `${Math.round(d.elapsedMs / 100) / 10} s`}`
  );
  return lines.join("\n");
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
      pageUrl,
      event_id,
      attribution,
    } = body;

    // --- Honeypot: bot yashirin maydonni to'ldirgan — jim turib "qabul qilindi" deymiz ---
    if (typeof body.website === "string" && body.website.trim() !== "") {
      console.warn("[LEAD GUARD] honeypot to'ldirilgan — lid yuborilmadi");
      return NextResponse.json({ success: true, track: false });
    }

    // --- Validatsiya ---
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Ism kiritilmagan" }, { status: 400 });
    }
    if (!phone || !isValidUzMobile(phone)) {
      return NextResponse.json({ error: PHONE_ERROR }, { status: 400 });
    }

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    // Server ko'rgan UA ishonchliroq; bo'lmasa brauzer yuborgani
    const userAgent = clip(req.headers.get("user-agent") || body.userAgent, 500);
    const elapsedMs =
      typeof body.elapsedMs === "number" && Number.isFinite(body.elapsedMs) ? body.elapsedMs : null;

    // --- Qurilma tekshiruvi ---
    const deviceId = cleanDeviceId(body.deviceId) || cleanDeviceId(readCookie(req, "roost_did"));
    const devHash = ipUaHash(clientIp, userAgent);
    const device = await checkDevice(deviceId, devHash, phone);

    // Xuddi shu raqam qayta keldi — yangi lid ochmaymiz, mavjudiga izoh qo'shamiz
    if (device.duplicate) {
      console.log("[LEAD GUARD] dublikat — yangi lid yaratilmadi");
      try {
        await addRepeatNote({ name: name.trim(), phone: phone.trim() });
      } catch (err: any) {
        console.warn("[LEAD GUARD] dublikat izohi xatosi:", err?.message);
      }
      return NextResponse.json({ success: true, track: false });
    }

    // Shubha belgilari
    const flags: string[] = [];
    if (device.otherPhones.length > 0) {
      const n = device.otherPhones.length + 1;
      const prev = device.otherPhones[device.otherPhones.length - 1];
      flags.push(`shu qurilmadan ${n}-raqam (oldingi: ${maskPhone(prev)})`);
    }
    if (elapsedMs === null || elapsedMs < MIN_FILL_MS) {
      flags.push(
        elapsedMs === null
          ? "forma vaqti noma'lum"
          : `forma ${Math.round(elapsedMs / 100) / 10} soniyada yuborildi`
      );
    }
    const suspicious = flags.length > 0 ? `⚠️ SHUBHALI: ${flags.join("; ")}` : "";

    // Izoh matnini yig'amiz
    const commentParts: string[] = [];
    if (suspicious) commentParts.push(suspicious, "");
    if (roosters) commentParts.push(`🐔 Nechta xo'roz: ${roosters}`);
    if (problem) commentParts.push(`❓ Muammo: ${problem}`);
    if (interestedProduct) commentParts.push(`📦 Qiziqqan mahsulot: ${interestedProduct}`);
    commentParts.push(`🔗 Manba: ${source || "roost.uz"}`);
    commentParts.push(
      "",
      buildSourceInfo({ attribution, fbp, fbc, pageUrl: pageUrl || "", userAgent, clientIp, elapsedMs })
    );
    const comment = commentParts.join("\n");

    // 1-QADAM: amoCRM
    let amoResult: any = null;
    try {
      amoResult = await createAmoCRMLead({
        name: name.trim(),
        phone: phone.trim(),
        comment,
        namePrefix: suspicious,
        fbp,
        fbc,
        clientIp,
        userAgent,
      });
    } catch (amoErr: any) {
      console.error("[AMOCRM XATO]", amoErr.message);
      amoResult = { error: amoErr.message };
      await releaseLock(phone);
    }

    // Raqamni qurilma ro'yxatiga yozamiz (keyingi boshqa raqam shubhali bo'ladi)
    if (!amoResult?.error) await rememberDevice(deviceId, devHash, phone);

    // 2-QADAM: Meta CAPI (Lead) — shubhali va takroriy lidlar Meta'ga yuborilmaydi,
    // aks holda reklama algoritmi soxta lidlardan "o'rganadi"
    const track = !suspicious && !amoResult?.duplicate;
    let metaResult: any = null;
    if (track) {
      try {
        metaResult = await sendToMetaCAPI({
          name: name.trim(),
          phone: phone.trim(),
          fbp,
          fbc,
          clientIp,
          userAgent,
          pageUrl: pageUrl || process.env.NEXT_PUBLIC_SITE_URL || "",
          contactId: amoResult?.contactId ? String(amoResult.contactId) : "",
          leadId: amoResult?.leadId ? String(amoResult.leadId) : "",
          eventId: event_id,
        });
      } catch (metaErr: any) {
        console.error("[META XATO]", metaErr.message);
        metaResult = { error: metaErr.message };
      }
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
        warning: suspicious,
        repeat: !!amoResult?.duplicate,
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

    return NextResponse.json({ success: true, track });
  } catch (err: any) {
    console.error("[LEAD API ERROR]", err);
    return NextResponse.json({ error: err.message || "Server xatosi" }, { status: 500 });
  }
}

// Qurilma/qulf bo'yicha dublikat: yangi lid ochmaymiz, mavjud lid topilsa izoh qo'shamiz
async function addRepeatNote(data: { name: string; phone: string }) {
  const DOMAIN = process.env.AMOCRM_DOMAIN;
  const ACCESS_TOKEN = process.env.AMOCRM_ACCESS_TOKEN;
  if (!DOMAIN || !ACCESS_TOKEN) return;
  const PIPELINE_ID = process.env.AMOCRM_PIPELINE_ID
    ? parseInt(process.env.AMOCRM_PIPELINE_ID)
    : null;
  const baseUrl = `https://${DOMAIN}`;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${ACCESS_TOKEN}` };
  const existing = await findRecentLeadByPhone(baseUrl, headers, data.phone, PIPELINE_ID);
  if (!existing?.leadId) return;
  await fetch(`${baseUrl}/api/v4/leads/${existing.leadId}/notes`, {
    method: "POST",
    headers,
    body: JSON.stringify([
      {
        note_type: "common",
        params: {
          text: `♻️ Takroriy murojaat (sayt formasi, shu qurilmadan)\nMijoz: ${data.name}\nTelefon: ${data.phone}`,
        },
      },
    ]),
  });
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
  warning?: string;
  repeat?: boolean;
}) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
  // Massajor bilan bir xil nom (TELEGRAM_CHAT_ID) yoki eski TELEGRAM_GROUP_ID
  const CHAT_ID =
    process.env.TELEGRAM_CHAT_ID?.trim() || process.env.TELEGRAM_GROUP_ID?.trim();

  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn("[TELEGRAM] credentials yo'q, o'tkazib yuborildi");
    return { skipped: true };
  }

  const lines: string[] = [];
  if (data.warning) lines.push(`<b>${escapeHtml(data.warning)}</b>`, "");
  lines.push(
    data.repeat ? "♻️ <b>Takroriy ROOST murojaat</b>" : "🐓 <b>Yangi ROOST lid!</b>",
    "",
    `👤 <b>Ism:</b> ${escapeHtml(data.name)}`,
    `📞 <b>Telefon:</b> ${escapeHtml(data.phone)}`
  );
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
  namePrefix?: string;
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

  // --- DUBLIKAT TEKSHIRUVI ---
  // Shu telefon so'nggi 24 soatda "Воронка"da bormi? Bo'lsa yangi lid ochmaymiz,
  // faqat mavjud lidga izoh qo'shamiz (sayt + FB retry + ikki manba — hammasini qamraydi).
  const existing = await findRecentLeadByPhone(baseUrl, headers, data.phone, PIPELINE_ID);
  if (existing?.leadId) {
    console.log(`[AMOCRM DEDUP] Dublikat aniqlandi — telefon ${data.phone}, mavjud lead ${existing.leadId}`);
    if (data.comment) {
      try {
        const noteText = [
          `♻️ Takroriy murojaat (sayt formasi)`,
          `Mijoz: ${data.name}`,
          `Telefon: ${data.phone}`,
          `\n${data.comment}`,
        ]
          .filter(Boolean)
          .join("\n");
        await fetch(`${baseUrl}/api/v4/leads/${existing.leadId}/notes`, {
          method: "POST",
          headers,
          body: JSON.stringify([{ note_type: "common", params: { text: noteText } }]),
        });
      } catch (err) {
        console.warn("[AMOCRM DEDUP] Izoh qo'shishda xatolik:", err);
      }
    }
    return { leadId: existing.leadId, contactId: existing.contactId, duplicate: true };
  }

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
            name: `${data.namePrefix ? data.namePrefix + " | " : ""}${data.name} - ${data.phone}`,
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
      // Izoh boshida shubha belgisi bo'lsin (comment ichida ham bor — bu yerda takrorlamaymiz)
      const body = data.namePrefix ? data.comment.replace(`${data.namePrefix}\n\n`, "") : data.comment;
      const noteText = [data.namePrefix, `Mijoz: ${data.name}`, `Telefon: ${data.phone}`, `\n${body}`]
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

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

/**
 * AmoCRM webhook endpoint (Roost)
 * Lid "Dostavkaga chiqarildi" bosqichiga o'tganda Meta'ga Purchase event yuboradi.
 * Purchase summasi amoCRM bitim summasidan olinadi (mahsulotlar har xil narx).
 *
 * env AMOCRM_DELIVERY_STATUS_ID = "Dostavkaga chiqarildi" status_id
 */

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const data: Record<string, any> = {};
    for (const [key, value] of formData.entries()) data[key] = value;

    console.log("[ROOST PURCHASE WEBHOOK] Received:", JSON.stringify(data));

    const leadId = data["leads[status][0][id]"];
    const statusId = data["leads[status][0][status_id]"];
    const pipelineId = data["leads[status][0][pipeline_id]"];
    const price = data["leads[status][0][price]"];

    if (!leadId) {
      console.warn("[ROOST PURCHASE] Lid ID yo'q");
      return NextResponse.json({ ok: true });
    }

    // Faqat Roost varonkasidan kelgan hodisalarni qabul qilamiz.
    // Muhim: 142/143 amoCRM tizim status'lari — boshqa varonkalarda ham
    // takrorlanadi, shuning uchun pipeline_id ni ham tekshiramiz.
    const PIPELINE_ID = process.env.AMOCRM_PIPELINE_ID;
    if (PIPELINE_ID && pipelineId && pipelineId !== PIPELINE_ID) {
      console.log(`[ROOST PURCHASE] Boshqa varonka (${pipelineId}) — o'tkazib yuborildi`);
      return NextResponse.json({ ok: true });
    }

    // Faqat "dostavkaga chiqazildi" bosqichida ishlaydi (Roost status_id = 142)
    const DELIVERY_STATUS_ID = process.env.AMOCRM_DELIVERY_STATUS_ID;
    if (DELIVERY_STATUS_ID && statusId !== DELIVERY_STATUS_ID) {
      console.log(`[ROOST PURCHASE] Bosqich ${statusId} — Dostavka emas`);
      return NextResponse.json({ ok: true });
    }

    const leadInfo = await fetchLeadDetails(leadId);
    if (!leadInfo) {
      console.error("[ROOST PURCHASE] Lid topilmadi");
      return NextResponse.json({ ok: true });
    }

    // Summa: webhook price yoki amoCRM bitim summasi
    const finalPrice = parseFloat(price) || leadInfo.price || 0;
    if (!finalPrice || finalPrice <= 0) {
      console.warn(`[ROOST PURCHASE] ❌ Summa 0 (${finalPrice}) — yuborilmadi`);
      return NextResponse.json({ ok: true, skipped: true, reason: "Summa kiritilmagan" });
    }

    const result = await sendPurchaseToMeta({
      leadId: String(leadId),
      contactId: leadInfo.contactId,
      phone: leadInfo.phone,
      email: leadInfo.email,
      name: leadInfo.name,
      fbp: leadInfo.fbp,
      fbc: leadInfo.fbc,
      clientIp: leadInfo.clientIp,
      clientUserAgent: leadInfo.clientUserAgent,
      price: finalPrice,
    });

    return NextResponse.json({ ok: true, meta: result });
  } catch (err: any) {
    console.error("[ROOST PURCHASE ERROR]", err);
    return NextResponse.json({ ok: true });
  }
}

async function fetchLeadDetails(leadId: string) {
  const DOMAIN = process.env.AMOCRM_DOMAIN;
  const ACCESS_TOKEN = process.env.AMOCRM_ACCESS_TOKEN;
  const FIELD_FBP = process.env.AMOCRM_FIELD_FBP;
  const FIELD_FBC = process.env.AMOCRM_FIELD_FBC;
  const FIELD_IP = process.env.AMOCRM_FIELD_IP;
  const FIELD_USER_AGENT = process.env.AMOCRM_FIELD_USER_AGENT;

  if (!DOMAIN || !ACCESS_TOKEN) return null;
  const headers = { Authorization: `Bearer ${ACCESS_TOKEN}` };

  try {
    const leadRes = await fetch(
      `https://${DOMAIN}/api/v4/leads/${leadId}?with=contacts`,
      { headers }
    );
    if (!leadRes.ok) return null;
    const lead = await leadRes.json();
    const contactId = lead?._embedded?.contacts?.[0]?.id;
    if (!contactId) return null;

    let fbp = "";
    let fbc = "";
    let clientIp = "";
    let clientUserAgent = "";

    for (const field of lead.custom_fields_values || []) {
      const fid = String(field.field_id);
      if (FIELD_FBP && fid === FIELD_FBP) fbp = field.values?.[0]?.value || "";
      if (FIELD_FBC && fid === FIELD_FBC) fbc = field.values?.[0]?.value || "";
      if (FIELD_IP && fid === FIELD_IP) clientIp = field.values?.[0]?.value || "";
      if (FIELD_USER_AGENT && fid === FIELD_USER_AGENT)
        clientUserAgent = field.values?.[0]?.value || "";
    }

    const contactRes = await fetch(`https://${DOMAIN}/api/v4/contacts/${contactId}`, {
      headers,
    });
    if (!contactRes.ok) return null;
    const contact = await contactRes.json();

    let phone = "";
    let email = "";
    for (const field of contact.custom_fields_values || []) {
      if (field.field_code === "PHONE") phone = field.values?.[0]?.value || "";
      if (field.field_code === "EMAIL") email = field.values?.[0]?.value || "";
    }

    return {
      contactId: String(contactId),
      name: contact.name || "",
      phone,
      email,
      fbp,
      fbc,
      clientIp,
      clientUserAgent,
      price: lead.price || 0,
    };
  } catch (err) {
    console.error("[ROOST FETCH LEAD]", err);
    return null;
  }
}

async function sendPurchaseToMeta(data: {
  leadId: string;
  contactId: string;
  phone: string;
  email: string;
  name: string;
  fbp: string;
  fbc: string;
  clientIp: string;
  clientUserAgent: string;
  price: number;
}) {
  const PIXEL_ID = process.env.META_PIXEL_ID;
  const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn("[ROOST PURCHASE] Credentials yo'q");
    return { skipped: true };
  }

  const hash = (v: string) =>
    crypto.createHash("sha256").update(v.toLowerCase().trim()).digest("hex");
  const normalizedPhone = data.phone.replace(/[\s\-\(\)\+]/g, "");
  const nameParts = (data.name || "").trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const userData: Record<string, any> = {};
  if (normalizedPhone) userData.ph = [hash(normalizedPhone)];
  if (data.email) userData.em = [hash(data.email)];
  if (firstName) userData.fn = [hash(firstName)];
  if (lastName) userData.ln = [hash(lastName)];
  if (data.contactId) userData.external_id = [hash(data.contactId)];
  userData.country = [hash("uz")];
  if (data.fbp) userData.fbp = data.fbp;
  if (data.fbc) userData.fbc = data.fbc;
  if (data.clientIp) userData.client_ip_address = data.clientIp;
  if (data.clientUserAgent) userData.client_user_agent = data.clientUserAgent;

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: `purchase_${data.leadId}`,
        event_source_url: process.env.NEXT_PUBLIC_SITE_URL || "https://roost.uz",
        action_source: "website",
        user_data: userData,
        custom_data: { currency: "UZS", value: data.price },
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
    console.error("[ROOST PURCHASE ERROR]", result);
    return { error: result };
  }
  console.log(`[ROOST PURCHASE] ✅ Yuborildi! Summa: ${data.price} UZS`);
  return result;
}

import { NextRequest, NextResponse } from "next/server";
import { findRecentLeadByPhone } from "@/lib/amocrm-dedup";

export const runtime = "nodejs";

// Meta bitta leadgen'ni bir necha marta yuboradi (retry). Shu instans ichida
// qayta ishlangan leadgen_id larni eslab qolamiz — bir leadgen faqat bir marta.
const processedLeadgen = new Set<string>();

/**
 * Meta webhook (Facebook Lead Ads) — Roost
 *
 * Lead Ads formasi to'ldirilganda Meta avtomatik Lead eventini hisoblaydi.
 * Bu yerda Meta'ga qayta event YUBORMAYMIZ (dublikat bo'lmasligi uchun) —
 * faqat amoCRM'ga "Facebook Lead Ads" manbasidan lid o'tkazamiz.
 * Purchase keyinchalik amocrm-purchase webhook orqali ketadi.
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[ROOST META WEBHOOK] Verification successful");
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[ROOST META WEBHOOK] Received:", JSON.stringify(body));

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === "leadgen") {
          await handleLeadgenEvent(change.value);
        }
      }
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[ROOST META WEBHOOK ERROR]", err);
    return NextResponse.json({ received: true });
  }
}

async function handleLeadgenEvent(value: any) {
  const { leadgen_id, form_id, ad_id, campaign_id } = value;
  console.log("[ROOST LEADGEN] New lead:", leadgen_id);

  // 1-qalqon: shu leadgen_id shu instansda allaqachon ishlanganmi? (Meta retry)
  if (leadgen_id && processedLeadgen.has(String(leadgen_id))) {
    console.log(`[ROOST LEADGEN DEDUP] ${leadgen_id} allaqachon ishlangan — o'tkazib yuborildi`);
    return;
  }
  if (leadgen_id) processedLeadgen.add(String(leadgen_id));

  try {
    const leadRes = await fetch(
      `https://graph.facebook.com/v21.0/${leadgen_id}?access_token=${process.env.META_ACCESS_TOKEN}`
    );
    const leadData = await leadRes.json();

    const fields: Record<string, string> = {};
    for (const field of leadData.field_data || []) {
      fields[field.name] = field.values?.[0] || "";
    }

    const fullName = fields["full_name"] || fields["first_name"] || "Facebook Lead";
    const phone = fields["phone_number"] || fields["phone"] || "";

    await createAmoLeadFromLeadAds({
      name: fullName,
      phone,
      leadgenId: leadgen_id,
      formId: form_id,
      adId: ad_id,
      campaignId: campaign_id,
    });

    console.log("[ROOST LEADGEN] AmoCRM ga forward qilindi");
  } catch (err) {
    console.error("[ROOST LEADGEN ERROR]", err);
  }
}

async function createAmoLeadFromLeadAds(data: {
  name: string;
  phone: string;
  leadgenId: string;
  formId: string;
  adId?: string;
  campaignId?: string;
}) {
  const DOMAIN = process.env.AMOCRM_DOMAIN;
  const ACCESS_TOKEN = process.env.AMOCRM_ACCESS_TOKEN;
  const PIPELINE_ID = process.env.AMOCRM_PIPELINE_ID
    ? parseInt(process.env.AMOCRM_PIPELINE_ID)
    : null;

  if (!DOMAIN || !ACCESS_TOKEN) return;

  const baseUrl = `https://${DOMAIN}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  };

  // 2-qalqon: shu telefon so'nggi 24 soatda "Воронка"da bormi? (sayt + FB retry)
  const existing = await findRecentLeadByPhone(baseUrl, headers, data.phone, PIPELINE_ID);
  if (existing?.leadId) {
    console.log(
      `[ROOST LEADGEN DEDUP] Telefon ${data.phone} uchun mavjud lead ${existing.leadId} — yangi ochilmadi`
    );
    try {
      await fetch(`${baseUrl}/api/v4/leads/${existing.leadId}/notes`, {
        method: "POST",
        headers,
        body: JSON.stringify([
          {
            note_type: "common",
            params: {
              text: `♻️ Takroriy murojaat (Facebook Lead Ads)\nMijoz: ${data.name}\nTelefon: ${data.phone}\nleadgen_id: ${data.leadgenId}`,
            },
          },
        ]),
      });
    } catch {
      /* izoh muhim emas */
    }
    return;
  }

  const unsortedPayload = [
    {
      source_name: "Roost Facebook Lead Ads",
      source_uid: `roost_fb_leadgen_${data.leadgenId}`,
      ...(PIPELINE_ID ? { pipeline_id: PIPELINE_ID } : {}),
      metadata: {
        form_id: data.formId,
        form_name: `Roost FB Lead Form ${data.formId}`,
        form_page: "facebook.com",
        ip: "0.0.0.0",
        form_sent_at: Math.floor(Date.now() / 1000),
        referer: "facebook.com",
      },
      _embedded: {
        leads: [
          {
            name: `${data.name} - ${data.phone} (FB)`,
            ...(PIPELINE_ID ? { pipeline_id: PIPELINE_ID } : {}),
          },
        ],
        contacts: [
          {
            name: data.name,
            custom_fields_values: [
              { field_code: "PHONE", values: [{ value: data.phone, enum_code: "WORK" }] },
            ],
          },
        ],
      },
    },
  ];

  const res = await fetch(`${baseUrl}/api/v4/leads/unsorted/forms`, {
    method: "POST",
    headers,
    body: JSON.stringify(unsortedPayload),
  });
  if (!res.ok) {
    const errData = await res.json();
    console.error("[ROOST AMOCRM LEAD ADS] Xatolik:", errData);
  }
}

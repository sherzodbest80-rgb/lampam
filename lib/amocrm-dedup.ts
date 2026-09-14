// amoCRM dublikat lidlarni oldini olish uchun umumiy yordamchi.
// Sayt formasi (/api/lead) va Facebook Lead Ads webhook (/api/webhook/meta)
// ikkalasi ham lid yaratishdan oldin shu funksiyani chaqiradi.
//
// MUHIM: Roost lidlari amoCRM'ning "Неразобранное" (unsorted) navbatiga tushadi.
// Unsorted lidlar `contacts?query=` orqali doim ham topilmaydi (menejer qabul
// qilmaguncha). Shuning uchun ikki manbani ham tekshiramiz:
//   1) /api/v4/leads/unsorted — yangi, hali qabul qilinmagan lidlar (asosiy)
//   2) /api/v4/contacts?query= — allaqachon varonkaga qabul qilingan lidlar

// Telefon raqamini solishtirish uchun faqat raqamlarni qoldiramiz
export function normalizePhone(v: string): string {
  return (v || "").replace(/\D/g, "");
}

// Ikki telefon bir xilmi? Oxirgi 9 ta raqam bo'yicha aniq solishtiramiz
// (mamlakat kodi +998 bor/yo'qligidan qat'i nazar). endsWith ochiq emas —
// ikkala raqam ham >= 9 xonali bo'lishi shart, aks holda mos deb topilmaydi.
export function samePhone(a: string, b: string): boolean {
  const na = normalizePhone(a);
  const nb = normalizePhone(b);
  if (na.length < 9 || nb.length < 9) return false;
  return na.slice(-9) === nb.slice(-9);
}

type Found = { leadId: number; contactId?: number } | null;

async function getJson(url: string, headers: Record<string, string>): Promise<any | null> {
  const res = await fetch(url, { method: "GET", headers });
  if (res.status === 204) return null;
  if (!res.ok) {
    console.warn("[AMOCRM DEDUP] GET xatosi:", res.status, url.split("?")[0]);
    return null;
  }
  return res.json();
}

/**
 * Shu telefon raqami bilan so'nggi `windowMs` (default 24 soat) ichida yaratilgan
 * lead bormi? Bor bo'lsa {leadId, contactId} qaytaradi — dublikat yaratmaslik uchun.
 * Xato yuz bersa null qaytaradi — hech qachon lidni bloklamaydi (lid yo'qolmasin).
 */
export async function findRecentLeadByPhone(
  baseUrl: string,
  headers: Record<string, string>,
  phone: string,
  pipelineId: number | null,
  windowMs: number = 24 * 60 * 60 * 1000
): Promise<Found> {
  const target = normalizePhone(phone);
  if (!target || target.length < 9) return null;
  const cutoff = Math.floor((Date.now() - windowMs) / 1000);

  try {
    // --- 1) UNSORTED navbat (yangi Roost lidlari shu yerda) ---
    const unsortedHit = await searchUnsorted(baseUrl, headers, phone, pipelineId, cutoff);
    if (unsortedHit) return unsortedHit;

    // --- 2) Qabul qilingan lidlar: contacts?query= ---
    const contactHit = await searchAcceptedByContact(
      baseUrl,
      headers,
      phone,
      pipelineId,
      cutoff
    );
    if (contactHit) return contactHit;

    return null;
  } catch (err) {
    console.warn("[AMOCRM DEDUP] kutilmagan xatolik:", err);
    return null; // xatoda bloklamaymiz
  }
}

// Неразобранное navbatidagi lidlar orasidan telefon bo'yicha qidiramiz.
async function searchUnsorted(
  baseUrl: string,
  headers: Record<string, string>,
  phone: string,
  pipelineId: number | null,
  cutoff: number
): Promise<Found> {
  const pipeParam = pipelineId ? `&filter[pipeline_id]=${pipelineId}` : "";
  // Eng yangilaridan boshlab (order[created_at]=desc), 50 tadan ko'p emas —
  // Неразобранное n8n bilan tez taqsimlanadi, shuning uchun navbat kichik.
  const json = await getJson(
    `${baseUrl}/api/v4/leads/unsorted?limit=50&order[created_at]=desc${pipeParam}`,
    headers
  );
  const items: any[] = json?._embedded?.unsorted || [];

  let contactLookups = 0;
  for (const item of items) {
    if ((item.created_at || 0) < cutoff) continue; // eski — dublikat emas

    // 1-yo'l: metadata ichidagi form ma'lumotidan telefon (arzon, qo'shimcha so'rovsiz)
    const metaPhone = extractPhoneFromMetadata(item.metadata);
    let matched = metaPhone ? samePhone(metaPhone, phone) : false;

    const contactRef = item._embedded?.contacts?.[0];
    // 2-yo'l: kontaktni to'liq o'qib, PHONE maydonini solishtiramiz.
    // Qo'shimcha so'rovlarni cheklaymiz (maksimum 25 ta kontakt tekshiruvi).
    if (!matched && contactRef?.id && contactLookups < 25) {
      contactLookups++;
      const contact = await getJson(
        `${baseUrl}/api/v4/contacts/${contactRef.id}`,
        headers
      );
      matched = contactHasPhone(contact, phone);
    }

    if (matched) {
      const leadId = item._embedded?.leads?.[0]?.id;
      if (leadId) return { leadId, contactId: contactRef?.id };
    }
  }
  return null;
}

// Kontaktni telefon bo'yicha topib, uning so'nggi ochiq lidini qaytaramiz.
async function searchAcceptedByContact(
  baseUrl: string,
  headers: Record<string, string>,
  phone: string,
  pipelineId: number | null,
  cutoff: number
): Promise<Found> {
  const json = await getJson(
    `${baseUrl}/api/v4/contacts?query=${encodeURIComponent(phone)}&with=leads&limit=10`,
    headers
  );
  const contacts: any[] = json?._embedded?.contacts || [];

  for (const c of contacts) {
    if (!contactHasPhone(c, phone)) continue;

    const leads = c._embedded?.leads || [];
    let best: { leadId: number; created: number } | null = null;
    for (const l of leads) {
      const lead = await getJson(`${baseUrl}/api/v4/leads/${l.id}`, headers);
      if (!lead) continue;
      if (pipelineId && lead.pipeline_id && lead.pipeline_id !== pipelineId) continue;
      const createdAt = lead.created_at || 0;
      if (createdAt < cutoff) continue;
      if (!best || createdAt > best.created) best = { leadId: lead.id, created: createdAt };
    }
    if (best) return { leadId: best.leadId, contactId: c.id };
  }
  return null;
}

// Kontakt obyektida (to'liq yoki with=leads bilan) shu telefon bormi?
function contactHasPhone(contact: any, phone: string): boolean {
  if (!contact) return false;
  for (const f of contact.custom_fields_values || []) {
    if (f.field_code === "PHONE") {
      for (const v of f.values || []) {
        if (samePhone(String(v.value || ""), phone)) return true;
      }
    }
  }
  return false;
}

// Unsorted metadata ichidan telefon raqamini ehtiyotkorlik bilan ajratamiz.
function extractPhoneFromMetadata(metadata: any): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  // Ba'zi manbalar telefonni metadata.phone yoki form maydonlarida yuboradi
  const candidates = [metadata.phone, metadata.PHONE, metadata.tel];
  for (const c of candidates) {
    if (c && normalizePhone(String(c)).length >= 9) return String(c);
  }
  return null;
}

// amoCRM dublikat lidlarni oldini olish uchun umumiy yordamchi.
// Sayt formasi (/api/lead) va Facebook Lead Ads webhook (/api/webhook/meta)
// ikkalasi ham lid yaratishdan oldin shu funksiyani chaqiradi.

// Telefon raqamini solishtirish uchun faqat raqamlarni qoldiramiz
export function normalizePhone(v: string): string {
  return (v || "").replace(/\D/g, "");
}

/**
 * Shu telefon raqami bilan so'nggi 24 soatda yaratilgan lead bormi?
 * Bor bo'lsa {leadId, contactId} qaytaradi — dublikat yaratmaslik uchun.
 * amoCRM: GET /api/v4/contacts?query=<phone>&with=leads → kontaktning leadlari tekshiriladi.
 * Xato yuz bersa null qaytaradi — hech qachon lidni bloklamaydi (lid yo'qolmasin).
 */
export async function findRecentLeadByPhone(
  baseUrl: string,
  headers: Record<string, string>,
  phone: string,
  pipelineId: number | null,
  windowMs: number = 24 * 60 * 60 * 1000
): Promise<{ leadId: number; contactId: number } | null> {
  const target = normalizePhone(phone);
  if (!target || target.length < 9) return null;

  try {
    const url = `${baseUrl}/api/v4/contacts?query=${encodeURIComponent(phone)}&with=leads&limit=10`;
    const res = await fetch(url, { method: "GET", headers });
    if (res.status === 204) return null; // topilmadi
    if (!res.ok) {
      console.warn("[AMOCRM DEDUP] contacts qidiruv xatosi:", res.status);
      return null;
    }
    const json = await res.json();
    const contacts = json?._embedded?.contacts || [];
    const cutoff = Math.floor((Date.now() - windowMs) / 1000);

    for (const c of contacts) {
      // Kontakt telefon raqamlaridan biri aynan mos kelishini tasdiqlaymiz
      const phones: string[] = [];
      for (const f of c.custom_fields_values || []) {
        if (f.field_code === "PHONE") {
          for (const v of f.values || []) phones.push(normalizePhone(String(v.value || "")));
        }
      }
      const phoneMatch = phones.some(
        (p) => p === target || p.endsWith(target) || target.endsWith(p)
      );
      if (!phoneMatch) continue;

      const leads = c._embedded?.leads || [];
      // Eng yangi, so'nggi 24 soatdagi, shu varonkadagi lidni qidiramiz
      let best: { leadId: number; contactId: number; created: number } | null = null;
      for (const l of leads) {
        const leadRes = await fetch(`${baseUrl}/api/v4/leads/${l.id}`, {
          method: "GET",
          headers,
        });
        if (!leadRes.ok) continue;
        const lead = await leadRes.json();
        if (pipelineId && lead.pipeline_id && lead.pipeline_id !== pipelineId) continue;
        const createdAt = lead.created_at || 0;
        if (createdAt < cutoff) continue; // 24 soatdan eski — dublikat emas
        if (!best || createdAt > best.created) {
          best = { leadId: lead.id, contactId: c.id, created: createdAt };
        }
      }
      if (best) return { leadId: best.leadId, contactId: best.contactId };
    }
    return null;
  } catch (err) {
    console.warn("[AMOCRM DEDUP] qidiruvda kutilmagan xatolik:", err);
    return null; // xatoda bloklamaymiz — lid yo'qolmasin
  }
}

// Telefon raqami tekshiruvi — client (LeadForm) va server (/api/lead) bir xil qoidani ishlatadi.

// Faqat O'zbekiston mobil operator kodlari
export const UZ_MOBILE_CODES = [
  "20", "33", "50", "55", "77", "88", "90", "91", "93", "94", "95", "97", "98", "99",
];

export const PHONE_ERROR = "Telefon raqamini tekshiring";

/** "+998 90 123 45 67" → "998901234567" */
export function phoneDigits(v: string): string {
  return (v || "").replace(/\D/g, "");
}

/**
 * To'g'ri O'zbekiston mobil raqamimi?
 * - 998 + 9 raqam
 * - operator kodi ro'yxatda
 * - abonent qismi (7 raqam) hammasi bir xil raqam emas (000 00 00, 111 11 11 ...)
 */
export function isValidUzMobile(v: string): boolean {
  const d = phoneDigits(v);
  if (!/^998\d{9}$/.test(d)) return false;
  if (!UZ_MOBILE_CODES.includes(d.slice(3, 5))) return false;
  if (/^(\d)\1{6}$/.test(d.slice(5))) return false;
  return true;
}

/** "998901234567" → "+998 90 123 45 67" */
export function prettyPhone(v: string): string {
  const d = phoneDigits(v);
  if (d.length !== 12) return "+" + d;
  return `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`;
}

/** "998901234567" → "+99890…4567" (izoh va Telegram uchun qisqartirilgan) */
export function maskPhone(v: string): string {
  const d = phoneDigits(v);
  if (d.length < 9) return "+" + d;
  return `+${d.slice(0, 5)}…${d.slice(-4)}`;
}

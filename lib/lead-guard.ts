// Soxta lidlardan himoya: "bitta qurilmadan bir nechta raqam" va dublikatlarni aniqlash.
//
// Qurilma ikki xil kalit bilan aniqlanadi:
//   1) brauzerdagi ID (localStorage + cookie "roost_did") — client yuboradi
//   2) server'da IP + User-Agent hash — brauzer ID tozalansa ham ushlaydi
// Har bir kalit ostida so'nggi 24 soatda yuborilgan raqamlar ro'yxati saqlanadi
// (Upstash Redis, REST API — qo'shimcha paket kerak emas).
//
// Redis sozlanmagan yoki xato bersa — himoya jim o'tkazib yuboriladi, lid hech qachon yo'qolmaydi.

import crypto from "crypto";
import { phoneDigits } from "./phone";

const TTL_SECONDS = 24 * 60 * 60;
const PREFIX = "roost:lg:";

function redisConfig(): { url: string; token: string } | null {
  const url = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "").trim();
  const token = (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();
  return url && token ? { url, token } : null;
}

export function isGuardEnabled(): boolean {
  return redisConfig() !== null;
}

// Bir nechta Redis buyrug'ini bitta so'rovda yuboradi. Xato bo'lsa null.
async function pipeline(commands: (string | number)[][]): Promise<any[] | null> {
  const cfg = redisConfig();
  if (!cfg) return null;
  try {
    const res = await fetch(`${cfg.url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands.map((c) => c.map(String))),
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) {
      console.warn("[LEAD GUARD] Redis xatosi:", res.status);
      return null;
    }
    const out: { result?: any; error?: string }[] = await res.json();
    return out.map((r) => (r.error ? null : r.result));
  } catch (err: any) {
    console.warn("[LEAD GUARD] Redis ulanmadi:", err?.name || err);
    return null;
  }
}

export function ipUaHash(ip: string, ua: string): string {
  return crypto.createHash("sha256").update(`${ip}|${ua}`).digest("hex").slice(0, 32);
}

export function cleanDeviceId(v: unknown): string {
  const s = typeof v === "string" ? v.trim() : "";
  return /^[A-Za-z0-9-]{8,64}$/.test(s) ? s : "";
}

function deviceKeys(deviceId: string, hash: string): string[] {
  const keys = [`${PREFIX}h:${hash}`];
  if (deviceId) keys.push(`${PREFIX}d:${deviceId}`);
  return keys;
}

export type DeviceCheck = {
  /** Shu raqam shu qurilmadan yoki boshqa joydan hozirgina yuborilgan (qayta yaratilmaydi) */
  duplicate: boolean;
  /** Shu qurilmadan 24 soat ichida yuborilgan BOSHQA raqamlar (eng eskisi birinchi) */
  otherPhones: string[];
};

/**
 * Lid yaratishdan oldin chaqiriladi.
 * - Qisqa qulf (60 s) — bir xil raqam ikki marta tez bosilsa ikkinchisi dublikat
 * - Qurilma ro'yxatida shu raqam bo'lsa — dublikat
 * - Qurilma ro'yxatida boshqa raqamlar bo'lsa — shubhali
 */
export async function checkDevice(deviceId: string, hash: string, phone: string): Promise<DeviceCheck> {
  const digits = phoneDigits(phone);
  const keys = deviceKeys(deviceId, hash);
  const res = await pipeline([
    ["SET", `${PREFIX}lock:${digits}`, "1", "NX", "EX", 60],
    ...keys.map((k) => ["LRANGE", k, 0, -1]),
  ]);
  if (!res) return { duplicate: false, otherPhones: [] };

  const lockTaken = res[0] !== "OK";
  const seen: string[] = [];
  for (const list of res.slice(1)) {
    for (const p of (list as string[]) || []) if (!seen.includes(p)) seen.push(p);
  }
  return {
    duplicate: lockTaken || seen.includes(digits),
    otherPhones: seen.filter((p) => p !== digits),
  };
}

/** amoCRM'ga yozish muvaffaqiyatsiz bo'lsa qulfni bo'shatamiz — mijoz qayta urina olsin. */
export async function releaseLock(phone: string): Promise<void> {
  await pipeline([["DEL", `${PREFIX}lock:${phoneDigits(phone)}`]]);
}

/** Lid qabul qilingandan keyin raqamni qurilma ro'yxatiga yozadi (24 soat). */
export async function rememberDevice(deviceId: string, hash: string, phone: string): Promise<void> {
  const digits = phoneDigits(phone);
  const cmds: (string | number)[][] = [];
  for (const k of deviceKeys(deviceId, hash)) {
    cmds.push(["LREM", k, 0, digits], ["RPUSH", k, digits], ["EXPIRE", k, TTL_SECONDS]);
  }
  await pipeline(cmds);
}

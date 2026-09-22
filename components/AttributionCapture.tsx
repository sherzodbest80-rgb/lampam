"use client";

import { useEffect } from "react";

/**
 * Sessiyadagi birinchi sahifa manbasini (utm_*, fbclid, referrer, kirish URL) eslab qoladi —
 * mijoz bosh sahifadan /forma ga o'tsa ham lid izohida reklama manbasi ko'rinsin.
 */
export default function AttributionCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const utm: Record<string, string> = {};
      params.forEach((v, k) => {
        if (k.startsWith("utm_") && v) utm[k] = v.slice(0, 150);
      });
      const hasAd = Object.keys(utm).length > 0 || params.has("fbclid");
      // Birinchi kirishni saqlaymiz; reklama belgisi bilan yangi kirish bo'lsa — yangilaymiz
      if (sessionStorage.getItem("roost_attr") && !hasAd) return;
      sessionStorage.setItem(
        "roost_attr",
        JSON.stringify({
          utm,
          fbclid: params.has("fbclid"),
          referrer: document.referrer.slice(0, 300),
          landingUrl: window.location.href.slice(0, 400),
        })
      );
    } catch {}
  }, []);
  return null;
}

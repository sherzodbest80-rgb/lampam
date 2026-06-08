# LAMPAM Uzbekistan

Next.js 15 + TypeScript + Tailwind CSS sayti — xo'roz vitaminlari savdosi.

## 🚀 Boshlash

```bash
# 1. Paketlarni o'rnatish
npm install

# 2. Lokal serverni ishga tushirish
npm run dev
```

Brauzeringizda oching: [http://localhost:3000](http://localhost:3000)

## 📁 Sahifalar

- `/` — Bosh sahifa
- `/products/[slug]` — Mahsulot sahifasi (9 ta mahsulot)
- `/forma` — Buyurtma formasi
- `/thanks` — Rahmat sahifasi

## 🎨 Tahrirlash

- **Brend ranglari:** `tailwind.config.ts` ichida `lampam-blue`, `lampam-navy`, `lampam-green`
- **Mahsulotlar:** `lib/products.ts` (9 ta mahsulot massivi)
- **Rasmlar:** `public/products/` papkasida
- **Header/Footer:** `components/Header.tsx` va `components/Footer.tsx`
- **Forma:** `components/LeadForm.tsx`

## ⚙️ Kerakli sozlamalar (keyin)

Hozir forma faqat vizual. Quyidagilar keyin qo'shiladi:

1. **AmoCRM ulanishi** — lid yaratish
2. **Telegram bot** — bildirishnoma yuborish
3. **Meta Pixel + CAPI** — reklama atributsiyasi
4. **API route** — `/app/api/lead/route.ts`

Yangi mahsulot qo'shish uchun:
- `lib/products.ts` ga yangi mahsulot ob'ekti qo'shing
- Rasm `public/products/<NOM>.png` ga joylang
- `image` maydonida `/products/<NOM>.png` ko'rsating

## 📞 Aloqa

Telefon raqamini barcha joylarda almashtirish kerak:
- `components/Header.tsx`
- `components/Footer.tsx`
- `app/thanks/page.tsx`

Qidirib toping: `+998901234567`

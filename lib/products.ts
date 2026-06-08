export type ProductCategory = "mushak" | "oyoq" | "nafas" | "parvarish";

export interface Product {
  slug: string;
  name: string;
  image: string;
  size: string;
  category: ProductCategory;
  categoryLabel: string;
  categoryEmoji: string;
  shortDesc: string;
  tagline: string;
  highlights: { text: string }[];
  benefits: string;
  problems: string;
  usage?: {
    amount: string;
    perDay: string;
    duration: string;
    note: string;
  };
  badge?: string;
}

export const products: Product[] = [
  {
    slug: "mega-c-21",
    name: "MEGA C 21",
    image: "/products/MEGA-C-21.png",
    size: "100 tabletka",
    category: "mushak",
    categoryLabel: "Mushak va kuch",
    categoryEmoji: "💪",
    shortDesc: "Suyak, tendon va chidamlilik uchun. Tayyorgarlik davrida xo'rozni mustahkam ushlab turadi.",
    tagline: "Suyak, tendon va chidamlilik uchun professional vitamin. Tayyorgarlik davrida xo'rozni mustahkam holatda ushlab turadi.",
    highlights: [
      { text: "<strong>Suyak va pay</strong> mustahkamligi uchun" },
      { text: "<strong>Chidamlilik</strong> va bardoshlilikni oshiradi" },
      { text: "<strong>Tumshuq, tirnoq, shpora</strong> mo'rtligiga qarshi" },
      { text: "<strong>Tayyorgarlik davrida</strong> kuch va energiya" },
    ],
    benefits: "Suyak, pay/tendon va mushaklarni qo'llab-quvvatlaydi. Chidamlilik va bardoshlilikni oshirishga yordam beradi. Tumshuq, tirnoq va shpora mustahkamligi uchun pozitsiyalanadi.",
    problems: "Tez charchash, suyak-pay zaifligi, jang/mashq davomida chidamlilik yetishmasligi, tumshuq/tirnoq/shpora mo'rtligi muammolari uchun.",
    usage: {
      amount: "1–2 tabletka",
      perDay: "1 marta",
      duration: "1–2 hafta",
      note: "Ketma-ket 3 haftadan ko'p bermaslik tavsiya qilingan. Aniq doza qadoq yo'riqnomasi bilan tasdiqlanadi.",
    },
    badge: "YANGI",
  },
  {
    slug: "ibd-292",
    name: "IBD 292",
    image: "/products/IBD-292-50.png",
    size: "50/100/200 tabletka",
    category: "mushak",
    categoryLabel: "Mushak va kuch",
    categoryEmoji: "💪",
    shortDesc: "Umumiy quvvat, mushak va chidamlilikni qo'llab-quvvatlovchi qo'shimcha.",
    tagline: "Lean muscle growth, kuch, chidamlilik va umumiy holatni qo'llab-quvvatlash uchun. Herbal/vitamin qo'shimcha.",
    highlights: [
      { text: "<strong>Mushak qurilishi</strong> va kuch uchun" },
      { text: "<strong>Umumiy quvvat</strong> va chidamlilik" },
      { text: "<strong>Tiklanish</strong> sustligiga qarshi" },
      { text: "<strong>60+ tabiiy giyoh</strong> tarkibida" },
    ],
    benefits: "Lean muscle growth, kuch, chidamlilik va umumiy holatni qo'llab-quvvatlash uchun pozitsiyalanadi. Herbal/vitamin qo'shimcha sifatida sotiladi.",
    problems: "Umumiy holsizlik, mushak zaifligi, chidamlilik pastligi, tiklanish sustligi.",
    usage: {
      amount: "1 tabletka",
      perDay: "1 marta",
      duration: "7–14 kun",
      note: "Holatga qarab veterinar yoki tajribali parvarishchi bilan maslahat qilinadi.",
    },
  },
  {
    slug: "ibd-4700",
    name: "IBD 4700",
    image: "/products/IBD-4700.png",
    size: "20 tabletka",
    category: "mushak",
    categoryLabel: "Mushak va kuch",
    categoryEmoji: "💪",
    shortDesc: "Qanot va oyoq mushaklari, mushak energiyasi va chidamlilik uchun.",
    tagline: "Vitamin-mineral qo'shimcha — mushaklarda energiya jarayonlarini, qanot va oyoq mushaklari ishini qo'llab-quvvatlaydi.",
    highlights: [
      { text: "<strong>Qanot</strong> va oyoq mushaklari uchun" },
      { text: "<strong>ATP/mushak energiyasi</strong> uchun" },
      { text: "<strong>Charchamaslik</strong> uchun" },
      { text: "<strong>Mashq va jang</strong> davomida quvvat" },
    ],
    benefits: "Vitamin-mineral qo'shimcha sifatida mushaklarda energiya jarayonlarini, qanot va oyoq mushaklari ishini, charchamaslikni qo'llab-quvvatlash uchun tavsiflangan.",
    problems: "Qanot kuchsizligi, oyoq mushaklari sustligi, tez toliqish, mashqda/jangda energiya yetishmasligi.",
  },
  {
    slug: "pro-fighter",
    name: "PRO FIGHTER",
    image: "/products/PRO-FIGHTER.png",
    size: "20 kapsula",
    category: "mushak",
    categoryLabel: "Mushak va kuch",
    categoryEmoji: "💪",
    shortDesc: "Tayyorgarlik davrida faollik va quvvatni qo'llab-quvvatlash uchun.",
    tagline: "Robert Laboratories (Belgium) — tayyorgarlik davrida faollik va quvvatni qo'llab-quvvatlash uchun mahsulot.",
    highlights: [
      { text: "<strong>Faollik</strong> va tetiklik uchun" },
      { text: "<strong>Kuch va performance</strong> uchun" },
      { text: "<strong>Belgian</strong> ishlab chiqaruvchisi" },
      { text: "<strong>20 kapsula</strong> qulay qadoqda" },
    ],
    benefits: "Nomlanishi va Lampam liniyasidagi o'rniga ko'ra jang/mashq oldi faolligi, quvvat va jangovar holatni qo'llab-quvvatlash mahsuloti sifatida pozitsiyalanadi.",
    problems: "Sustlik, tayyorgarlik davrida quvvat yetishmasligi, aktivlik pastligi.",
  },
  {
    slug: "mega-tendon-tp248",
    name: "MEGA TENDON TP248",
    image: "/products/MEGA-TENDON-TP248.png",
    size: "50 tabletka",
    category: "oyoq",
    categoryLabel: "Oyoq va tendon",
    categoryEmoji: "🦵",
    shortDesc: "Oyoq, pay va tendon uchun. Tiklanish va mustahkamlikni qo'llab-quvvatlaydi.",
    tagline: "Ligament va tendonlarni oziqlantirish, oyoq mustahkamligi va elastikligini qo'llab-quvvatlash uchun.",
    highlights: [
      { text: "<strong>Ligament va tendon</strong> oziqlantirish" },
      { text: "<strong>Oyoq va to'piq</strong> mustahkamligi" },
      { text: "<strong>Elastiklik</strong> va kuch" },
      { text: "<strong>Jang/mashq</strong> keyin tiklanish" },
    ],
    benefits: "Ligament va tendonlarni oziqlantirish, oyoq/to'piq mustahkamligi va elastikligini qo'llab-quvvatlash, jang/mashqdan keyin tiklanishga yordam berish.",
    problems: "Oyoq bo'shligi, pay/tendon zaifligi, lat yeyish, yurolmaslikka moyillik, mashqdan keyin oyoq tiklanishi sustligi.",
    usage: {
      amount: "1 tabletka",
      perDay: "2 marta",
      duration: "15–21 kun",
      note: "Uzoq kursda holat kuzatiladi; qadoqdagi cheklovlar tekshiriladi.",
    },
  },
  {
    slug: "santolin-w-d",
    name: "SANTOLIN W-D",
    image: "/products/SANTOLIN-W-D-15ml.png",
    size: "15/35/60 ml",
    category: "nafas",
    categoryLabel: "Nafas va energiya",
    categoryEmoji: "🫁",
    shortDesc: "Nafas, energiya va faollikni qo'llab-quvvatlovchi mahsulot. Tomchili shakl.",
    tagline: "Energiya, faollik, jangovar kayfiyat va nafas/chidamlilikni qo'llab-quvvatlash uchun tomchi.",
    highlights: [
      { text: "<strong>Nafas va chidamlilik</strong> uchun" },
      { text: "<strong>Energiya va faollik</strong>" },
      { text: "<strong>Jangovar kayfiyat</strong>" },
      { text: "<strong>3 ta hajm:</strong> 15ml, 35ml, 60ml" },
    ],
    benefits: "Energiyani, faollikni, jangovar kayfiyatni va nafas/chidamlilikni qo'llab-quvvatlash uchun pozitsiyalanadi.",
    problems: "Tez hansirash, sustlik, qo'rquv yoki lohaslik, tayyorgarlik paytida energiya yetishmasligi.",
    usage: {
      amount: "3–5 tomchi",
      perDay: "1 marta",
      duration: "7–14 kun",
      note: "Og'izga tomiziladi. Kichik flakon varianti uchun qadoq yo'riqnomasini tekshiring.",
    },
    badge: "3 HAJM",
  },
  {
    slug: "mega-santolin-w-d",
    name: "Mega Santolin W-D",
    image: "/products/SANTOLIN-W-D-60ml.png",
    size: "60 ml",
    category: "nafas",
    categoryLabel: "Nafas va energiya",
    categoryEmoji: "🫁",
    shortDesc: "Energiya, nafas va tiklanish uchun katta hajmli variant. 7-14 kunlik kurs.",
    tagline: "Mushaklarni, uchish/faollikni, chidamlilikni va tiklanishni qo'llab-quvvatlash uchun 60 ml katta hajm.",
    highlights: [
      { text: "<strong>Energiya va nafas</strong> uchun" },
      { text: "<strong>Tiklanish</strong> jang/mashqdan keyin" },
      { text: "<strong>60 ml katta hajm</strong> kursga qulay" },
      { text: "<strong>Bir nechta xo'rozga</strong> yetadi" },
    ],
    benefits: "Mushaklarni, uchish/faollikni, chidamlilikni va tiklanishni qo'llab-quvvatlash uchun. 60 ml bo'lgani uchun bir nechta xo'rozga yoki kursga qulayroq.",
    problems: "Tez charchash, energiya pasayishi, musobaqadan/mashqdan keyingi tiklanish sustligi, ruhiy sustlik.",
    usage: {
      amount: "3–5 tomchi",
      perDay: "1 marta",
      duration: "7–14 kun",
      note: "Ayniqsa musobaqa/mashqdan keyin yoki kundalik parvarishda ishlatiladi.",
    },
  },
  {
    slug: "lp-oil",
    name: "LP-OIL",
    image: "/products/LP-OIL.png",
    size: "15 ml",
    category: "parvarish",
    categoryLabel: "Tashqi parvarish",
    categoryEmoji: "🛡️",
    shortDesc: "Tumshuq va shporani qattiqlashtirish va mustahkamlash uchun moy.",
    tagline: "Tumshuq va shpora parvarishi uchun tashqi moy. Qattiqlik va tayyorgarlikni qo'llab-quvvatlaydi.",
    highlights: [
      { text: "<strong>Tumshuq</strong> qattiqligini oshiradi" },
      { text: "<strong>Shpora</strong> mustahkamlash uchun" },
      { text: "<strong>Sinishidan</strong> saqlaydi" },
      { text: "<strong>Tashqi parvarish</strong> jang oldidan" },
    ],
    benefits: "Tumshuq va shporani qattiqlashtirish/mustahkamlash, o'sishini qo'llab-quvvatlash, jang/mashq oldidan tashqi parvarish.",
    problems: "Tumshuq yoki shpora mo'rtligi, shpora kuchsizligi, tashqi jangovar qismlarni parvarish qilish ehtiyoji.",
    usage: {
      amount: "Yetarli miqdorda surtiladi",
      perDay: "Ertalab va kechqurun",
      duration: "1 hafta davomida",
      note: "Qadoq yo'riqnomasi bilan tasdiqlash kerak. Manbalarda farq bor.",
    },
  },
  {
    slug: "fr-506",
    name: "FR 506",
    image: "/products/FR-506.png",
    size: "50 tabletka",
    category: "parvarish",
    categoryLabel: "Tashqi parvarish",
    categoryEmoji: "🛡️",
    shortDesc: "LAMPAM parvarish liniyasidagi mahsulot. Tavsifi menejer orqali.",
    tagline: "LAMPAM parvarish liniyasidagi mahsulot. Batafsil ma'lumot menejer orqali beriladi.",
    highlights: [
      { text: "<strong>LAMPAM</strong> parvarish liniyasi" },
      { text: "<strong>Mushak qo'llab-quvvatlash</strong>" },
      { text: "<strong>Energiya</strong> qo'shilishi" },
      { text: "<strong>50 tabletka</strong> qulay qadoq" },
    ],
    benefits: "FR 506 bo'yicha aniq tavsif menejer orqali tushuntiriladi. Lampam setlarida boshqa tayyorgarlik/parvarish mahsulotlari bilan birga uchraydi.",
    problems: "Aniq muammo/yechim menejer orqali tushuntiriladi. Umumiy parvarish va tayyorgarlik liniyasi sifatida ehtiyotkor joylashtiriladi.",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getSimilarProducts(currentSlug: string, category: ProductCategory, limit = 3): Product[] {
  return products
    .filter((p) => p.category === category && p.slug !== currentSlug)
    .slice(0, limit);
}

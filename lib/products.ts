export type ProductCategory = "mushak" | "oyoq" | "nafas" | "parvarish";

export interface Product {
  slug: string;
  name: string;
  image: string;
  size: string;
  price: number;
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

export function formatPrice(price: number): string {
  return price.toLocaleString("ru-RU").replace(/,/g, " ") + " so'm";
}

export const products: Product[] = [
  {
    slug: "mega-c-21",
    name: "MAX C 21",
    image: "/products/MEGA-C-21.png",
    size: "100 tabletka",
    price: 500000,
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
      name: "ABD 292",
    image: "/products/IBD-292-50.png",
    size: "100 tabletka",
    price: 420000,
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
      note: "Holatga qarab veterinar yoki tajribali parvarishchi bilan maslahat qilinadi. 50/200 tabletka variantlari ham mavjud.",
    },
  },
  {
    slug: "ibd-4700",
    name: "MAX 4700",
    image: "/products/IBD-4700.png",
    size: "20 tabletka",
    price: 250000,
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
    name: "MAX FIGHTER",
    image: "/products/PRO-FIGHTER.png",
    size: "20 kapsula",
    price: 240000,
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
    benefits: "Nomlanishi va Roost liniyasidagi o'rniga ko'ra jang/mashq oldi faolligi, quvvat va jangovar holatni qo'llab-quvvatlash mahsuloti sifatida pozitsiyalanadi.",
    problems: "Sustlik, tayyorgarlik davrida quvvat yetishmasligi, aktivlik pastligi.",
  },
  {
    slug: "mega-tendon-tp248",
    name: "MAX TP248",
    image: "/products/MEGA-TENDON-TP248.png",
    size: "50 tabletka",
    price: 250000,
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
    name: "MAX W-D",
    image: "/products/SANTOLIN-W-D-15ml.png",
    size: "15/35/60 ml",
    price: 230000,
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
      note: "Og'izga tomiziladi. Hajmga qarab narx farq qiladi — menejer aniq variantni tushuntiradi.",
    },
    badge: "3 HAJM",
  },
  {
    slug: "mega-santolin-w-d",
    name: "Mega Max W-D",
    image: "/products/SANTOLIN-W-D-60ml.png",
    size: "60 ml",
    price: 485000,
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
    name: "MAX-OIL",
    image: "/products/LP-OIL.png",
    size: "15 ml",
    price: 300000,
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
    price: 250000,
    category: "parvarish",
    categoryLabel: "Tashqi parvarish",
    categoryEmoji: "🛡️",
    shortDesc: "ROOST parvarish liniyasidagi mahsulot. Tavsifi menejer orqali.",
    tagline: "ROOST parvarish liniyasidagi mahsulot. Batafsil ma'lumot menejer orqali beriladi.",
    highlights: [
      { text: "<strong>ROOST</strong> parvarish liniyasi" },
      { text: "<strong>Mushak qo'llab-quvvatlash</strong>" },
      { text: "<strong>Energiya</strong> qo'shilishi" },
      { text: "<strong>50 tabletka</strong> qulay qadoq" },
    ],
    benefits: "FR 506 bo'yicha aniq tavsif menejer orqali tushuntiriladi. Roost setlarida boshqa tayyorgarlik/parvarish mahsulotlari bilan birga uchraydi.",
    problems: "Aniq muammo/yechim menejer orqali tushuntiriladi. Umumiy parvarish va tayyorgarlik liniyasi sifatida ehtiyotkor joylashtiriladi.",
  },
  {
    slug: "abd-a18-2000",
    name: "A-18 2000",
    image: "/products/ABD-A18-2000.png",
    size: "30 tabletka",
    price: 400000,
    category: "mushak",
    categoryLabel: "Mushak va kuch",
    categoryEmoji: "💪",
    shortDesc: "Jangovar quvvat va kuchni oshirish uchun kuchli boost qo'shimchasi. Tayyorgarlik va jang oldidan.",
    tagline: "Rooster Boost liniyasidagi kuchli qo'shimcha — xo'rozning jangovar quvvati, kuchi va tetikligini oshirish uchun.",
    highlights: [
      { text: "<strong>Jangovar quvvat</strong> va kuch uchun" },
      { text: "<strong>Tetiklik</strong> va faollikni oshiradi" },
      { text: "<strong>Tayyorgarlik davri</strong> uchun boost" },
      { text: "<strong>30 tabletka</strong> qulay qadoq" },
    ],
    benefits: "Xo'rozning jangovar quvvati, kuchi va tetikligini oshirish uchun pozitsiyalanadi. Tayyorgarlik va jang oldidan aktivlikni qo'llab-quvvatlaydi.",
    problems: "Sustlik, kuch yetishmasligi, jang oldidan tetiklik pastligi, tayyorgarlik davrida energiya kamligi.",
    usage: {
      amount: "1 tabletka",
      perDay: "1 marta",
      duration: "7–14 kun",
      note: "Aniq doza qadoq yo'riqnomasi bilan tasdiqlanadi. Menejer bilan maslahat qilinadi.",
    },
    badge: "YANGI",
  },
  {
    slug: "abd-696",
    name: "ABD 696",
    image: "/products/ABD-696.png",
    size: "200 tabletka",
    price: 800000,
    category: "mushak",
    categoryLabel: "Mushak va kuch",
    categoryEmoji: "💪",
    shortDesc: "Umumiy quvvat, mushak va chidamlilikni qo'llab-quvvatlovchi katta hajmli qo'shimcha.",
    tagline: "ABD seriyasidagi qo'shimcha — mushak, kuch va chidamlilikni qo'llab-quvvatlash uchun. Katta hajmli 200 tabletka qadoq.",
    highlights: [
      { text: "<strong>Mushak va kuch</strong> uchun" },
      { text: "<strong>Umumiy quvvat</strong> va chidamlilik" },
      { text: "<strong>Katta hajm</strong> — uzoq kursga qulay" },
      { text: "<strong>200 tabletka</strong> qadoq" },
    ],
    benefits: "Mushak qurilishi, kuch, chidamlilik va umumiy holatni qo'llab-quvvatlash uchun pozitsiyalanadi. Katta hajmi tufayli uzoq kurs yoki bir nechta xo'roz uchun qulay.",
    problems: "Umumiy holsizlik, mushak zaifligi, chidamlilik pastligi, tiklanish sustligi.",
    usage: {
      amount: "1 tabletka",
      perDay: "1 marta",
      duration: "7–14 kun",
      note: "Holatga qarab tajribali parvarishchi bilan maslahat qilinadi. ABD 292 bilan bir liniyada.",
    },
  },
  {
    slug: "abd-494",
    name: "ABD 494",
    image: "/products/ABD-494.png",
    size: "200 tabletka",
    price: 800000,
    category: "mushak",
    categoryLabel: "Mushak va kuch",
    categoryEmoji: "💪",
    shortDesc: "Kuch, mushak va jangovar holatni qo'llab-quvvatlovchi Belgiya qo'shimchasi.",
    tagline: "ABD seriyasidagi qo'shimcha (Belgium) — mushak, kuch va jangovar holatni qo'llab-quvvatlash uchun.",
    highlights: [
      { text: "<strong>Kuch va mushak</strong> uchun" },
      { text: "<strong>Jangovar holat</strong> va chidamlilik" },
      { text: "<strong>Belgiya</strong> ishlab chiqaruvchisi" },
      { text: "<strong>Tayyorgarlik</strong> davrida quvvat" },
    ],
    benefits: "Mushak, kuch, chidamlilik va jangovar holatni qo'llab-quvvatlash uchun pozitsiyalanadi. ABD liniyasining Belgiya mahsuloti.",
    problems: "Sustlik, mushak zaifligi, chidamlilik pastligi, jang oldidan quvvat yetishmasligi.",
    usage: {
      amount: "1 tabletka",
      perDay: "1 marta",
      duration: "7–14 kun",
      note: "Aniq doza qadoq yo'riqnomasi bilan tasdiqlanadi. Menejer bilan maslahat qilinadi.",
    },
  },
  {
    slug: "mega-vip-123",
    name: "MEGA VIP.123",
    image: "/products/MEGA-VIP-123.png",
    size: "12 ml",
    price: 700000,
    category: "nafas",
    categoryLabel: "Nafas va energiya",
    categoryEmoji: "🫁",
    shortDesc: "Tez so'riladigan energiya tomchisi. Faollik va tetiklikni darhol qo'llab-quvvatlaydi.",
    tagline: "\"High Energy\" — tez ta'sir qiluvchi energiya tomchisi. Faollik, tetiklik va chidamlilikni qo'llab-quvvatlash uchun.",
    highlights: [
      { text: "<strong>Tez ta'sir</strong> qiluvchi energiya" },
      { text: "<strong>Faollik va tetiklik</strong> uchun" },
      { text: "<strong>Chidamlilik</strong>ni qo'llab-quvvatlaydi" },
      { text: "<strong>Qulay tomchi</strong> shakli — 12 ml" },
    ],
    benefits: "Tez so'riladigan energiya manbai sifatida faollik, tetiklik va chidamlilikni qo'llab-quvvatlash uchun pozitsiyalanadi. Tomchi shakli tufayli qulay va tejamli ishlatiladi.",
    problems: "Sustlik, tez toliqish, energiya pastligi, faollik yetishmasligi — ayniqsa faol davrlarda quvvatni tez ko'tarish ehtiyoji uchun.",
    usage: {
      amount: "1–3 tomchi",
      perDay: "1 marta",
      duration: "Ehtiyojga qarab",
      note: "Og'izga yoki suvga tomiziladi. Aniq doza qadoq yo'riqnomasi bilan tasdiqlanadi. Menejer bilan maslahat qilinadi.",
    },
    badge: "YANGI",
  },
  {
    slug: "mega-super-2008",
    name: "MEGA SUPER 2008",
    image: "/products/MEGA-SUPER-2008.png",
    size: "45 ml",
    price: 870000,
    category: "mushak",
    categoryLabel: "Mushak va kuch",
    categoryEmoji: "💪",
    shortDesc: "\"High Muscle Energy\" — mushak energiyasi, kuch va chidamlilik uchun kuchli tomchi. Katta 45 ml hajm.",
    tagline: "\"High Muscle Energy\" — mushaklarga energiya, kuch va chidamlilikni qo'llab-quvvatlovchi yuqori quvvatli tomchi. Katta 45 ml hajm kursga qulay.",
    highlights: [
      { text: "<strong>Mushak energiyasi</strong> va kuch uchun" },
      { text: "<strong>Chidamlilik</strong> va bardoshlilikni qo'llab-quvvatlaydi" },
      { text: "<strong>Yuqori quvvat</strong> — kuchli formula" },
      { text: "<strong>Katta 45 ml</strong> hajm — kursga tejamli" },
    ],
    benefits: "Mushaklarga energiya berish, kuch va chidamlilikni qo'llab-quvvatlash uchun pozitsiyalanadi. Yuqori quvvatli formula bo'lgani uchun faol davrlarda ishlatiladi. 45 ml katta hajmi uzoq kurs yoki bir nechta parranda uchun qulay.",
    problems: "Mushak zaifligi, tez toliqish, kuch va energiya yetishmasligi, chidamlilik pastligi — ayniqsa faol davrlarda quvvatni oshirish ehtiyoji uchun.",
    usage: {
      amount: "1–3 tomchi",
      perDay: "1 marta",
      duration: "Ehtiyojga qarab",
      note: "Og'izga yoki suvga tomiziladi. Aniq doza qadoq yo'riqnomasi bilan tasdiqlanadi. Menejer bilan maslahat qilinadi.",
    },
    badge: "YANGI",
  },
  {
    slug: "super-power",
    name: "SUPER POWER",
    image: "/products/SUPER-POWER.png",
    size: "10 ml",
    price: 1350000,
    category: "nafas",
    categoryLabel: "Nafas va energiya",
    categoryEmoji: "🫁",
    shortDesc: "Kuchli quvvat va energiya uchun konsentratsiyalangan flakon. Zaxira yog'ni energiyaga aylantirishga yo'naltirilgan formula.",
    tagline: "SUPER POWER — parrandaning quvvati, faolligi va chidamliligini yuqori darajada qo'llab-quvvatlash uchun konsentratsiyalangan formula. 10 ml flakon.",
    highlights: [
      { text: "<strong>Yuqori quvvat</strong> va energiya uchun" },
      { text: "<strong>Zaxira yog'ni energiyaga</strong> aylantirishga yo'naltirilgan" },
      { text: "<strong>Faollik va chidamlilik</strong>ni qo'llab-quvvatlaydi" },
      { text: "<strong>Konsentratsiyalangan</strong> 10 ml flakon" },
    ],
    benefits: "Parrandaning quvvati, faolligi va chidamliligini kuchli darajada qo'llab-quvvatlash uchun pozitsiyalanadi. Formula zaxira yog'ni energiyaga aylantirishga yo'naltirilgan bo'lib, ayniqsa faol davrlarda quvvat ehtiyoji yuqori bo'lganda ishlatiladi. Konsentratsiyalangan 10 ml flakon shaklida.",
    problems: "Quvvat va energiya yetishmasligi, tez charchash, faollik va chidamlilik pastligi — parrandani yuqori faollik davriga tayyorlashda qo'shimcha quvvat ehtiyoji uchun.",
    usage: {
      amount: "Yo'riqnomaga muvofiq",
      perDay: "Ehtiyojga qarab",
      duration: "Faol davrda",
      note: "Konsentratsiyalangan flakon. Aniq doza va qo'llash tartibi qadoq yo'riqnomasi bilan belgilanadi. Menejer bilan maslahatlashib ishlatiladi.",
    },
    badge: "YANGI",
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

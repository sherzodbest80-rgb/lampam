"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { products } from "@/lib/products";

export default function HomePage() {
  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-8");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    document.querySelectorAll(".observe-fade").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const categories = [
    { emoji: "💪", name: "Mushak va kuch", desc: "Tayyorgarlik va chidamlilik uchun", count: 4, color: "#DC2626", bg: "#FEE2E2" },
    { emoji: "🦵", name: "Oyoq va tendon", desc: "Tiklanish va mustahkamlik", count: 1, color: "#0066B3", bg: "#DBEAFE" },
    { emoji: "🫁", name: "Nafas va energiya", desc: "Musobaqa kunlari uchun", count: 2, color: "#10B981", bg: "#D1FAE5" },
    { emoji: "🛡️", name: "Tashqi parvarish", desc: "Tumshuq, shpora, parvarish", count: 2, color: "#F59E0B", bg: "#FEF3C7" },
  ];

  return (
    <>
      <Header />

      {/* HERO */}
      <section className="bg-gradient-to-br from-lampam-blue to-lampam-navy text-white px-5 py-10 md:py-20 relative overflow-hidden">
        <div className="absolute -top-40 -right-32 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none animate-blob-move bg-[radial-gradient(circle,rgba(16,185,129,0.25)_0%,transparent_70%)]" />
        <div className="absolute -bottom-52 -left-40 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none animate-blob-move bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_70%)]" style={{ animationDelay: "-10s" }} />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-lampam-green/20 text-lampam-green-light px-4 py-2 rounded-full text-xs font-bold tracking-wider mb-4 md:mb-7 border border-lampam-green/40 backdrop-blur-sm opacity-0 translate-y-8 transition-all duration-700" style={{ animation: "fadeInUp 0.8s 0.1s ease-out forwards" }}>
            <span className="w-2 h-2 bg-lampam-green-light rounded-full animate-pulse-dot" />
            🇹🇭 THAILAND ASLI MAHSULOTLAR
          </div>

          <h1 className="font-display text-2xl sm:text-3xl md:text-5xl font-extrabold leading-tight mb-4 tracking-tight opacity-0 translate-y-8" style={{ animation: "fadeInUp 0.8s 0.2s ease-out forwards" }}>
            Thailand <span className="bg-gradient-to-br from-lampam-green-light to-lampam-green bg-clip-text text-transparent">№1</span> xo&apos;roz vitaminlari
            <br />endi O&apos;zbekistonda
          </h1>

          <p className="text-sm md:text-lg opacity-90 mb-6 md:mb-9 max-w-xl mx-auto opacity-0 translate-y-8" style={{ animation: "fadeInUp 0.8s 0.3s ease-out forwards" }}>
            Original LAMPAM mahsulotlari — xo&apos;rozingizning kuchi, salomatligi va chidamliligi uchun professional yechim
          </p>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6 md:mb-10 opacity-0 translate-y-8" style={{ animation: "fadeInUp 0.8s 0.4s ease-out forwards" }}>
            {["Original Thailand", "BEPUL yetkazib berish", "Professional maslahat"].map((feat) => (
              <div key={feat} className="flex items-center gap-2 bg-white/10 px-3 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:-translate-y-0.5 transition-all">
                <span className="text-lampam-green-light font-extrabold">✓</span> {feat}
              </div>
            ))}
          </div>

          <Link href="#products" className="inline-flex items-center gap-2.5 bg-white text-lampam-navy px-7 md:px-10 py-3 md:py-4 rounded-full font-bold text-sm md:text-base no-underline shadow-2xl hover:-translate-y-1 hover:shadow-3xl transition-all opacity-0 translate-y-8" style={{ animation: "fadeInUp 0.8s 0.5s ease-out forwards" }}>
            Mahsulotlarni ko&apos;rish <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="px-5 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block text-lampam-blue text-xs font-bold tracking-widest mb-3 uppercase">YO&apos;NALISHLAR</div>
          <h2 className="font-display text-3xl md:text-4xl text-lampam-navy font-extrabold mb-3 tracking-tight">Kategoriyalar</h2>
          <p className="text-slate-500 text-base">Xo&apos;rozingiz uchun kerakli mahsulotni tanlang</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <div key={i} className="observe-fade opacity-0 translate-y-8 transition-all duration-700 bg-white rounded-3xl p-7 border border-slate-200 cursor-pointer hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden" style={{ ['--accent' as string]: cat.color, ['--accent-bg' as string]: cat.bg }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4" style={{ background: cat.bg }}>
                {cat.emoji}
              </div>
              <h3 className="font-display text-xl text-lampam-navy font-bold mb-2">{cat.name}</h3>
              <p className="text-slate-500 text-sm mb-4">{cat.desc}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: cat.color }}>
                {cat.count} ta mahsulot →
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="bg-slate-50 px-5 py-20" id="products">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block text-lampam-blue text-xs font-bold tracking-widest mb-3 uppercase">KATALOG</div>
            <h2 className="font-display text-3xl md:text-4xl text-lampam-navy font-extrabold mb-3 tracking-tight">Bizning mahsulotlar</h2>
            <p className="text-slate-500 text-base">{products.length} ta professional vitamin va qo&apos;shimcha</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {products.map((product) => (
              <Link key={product.slug} href={`/products/${product.slug}`} className="observe-fade opacity-0 translate-y-8 transition-all duration-700 bg-white border border-slate-200 rounded-3xl overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:border-lampam-blue flex flex-col no-underline group">
                <div className="bg-white h-72 flex items-center justify-center relative overflow-hidden p-5">
                  {product.badge && (
                    <span className="absolute top-3.5 right-3.5 bg-gradient-to-br from-lampam-green to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider shadow-lg z-10">
                      {product.badge}
                    </span>
                  )}
                  <Image src={product.image} alt={product.name} width={300} height={300} className="max-w-full max-h-full object-contain animate-float-y group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <span className="inline-block bg-blue-50 text-lampam-blue text-xs font-bold px-3 py-1 rounded-full mb-3 w-fit tracking-wider">
                    {product.categoryEmoji} {product.categoryLabel.toUpperCase()}
                  </span>
                  <h3 className="font-display text-lg text-lampam-navy font-bold mb-1 tracking-tight">{product.name}</h3>
                  <div className="text-slate-500 text-sm mb-3 font-medium">{product.size}</div>
                  <p className="text-slate-600 text-sm mb-4 flex-1 leading-relaxed">{product.shortDesc}</p>
                  <span className="bg-lampam-blue text-white py-2.5 rounded-xl text-center font-semibold text-sm group-hover:bg-lampam-navy group-hover:scale-[1.02] transition-all">
                    Batafsil →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-slate-50 px-5 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block text-lampam-blue text-xs font-bold tracking-widest mb-3 uppercase">USTUNLIKLAR</div>
            <h2 className="font-display text-3xl md:text-4xl text-lampam-navy font-extrabold mb-3 tracking-tight">Nega LAMPAM Uzbekistan?</h2>
            <p className="text-slate-500 text-base">Sizning xo&apos;rozingiz uchun eng yaxshisi</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🇹🇭", title: "Thailanddan original", desc: "LAMPAM brendining O'zbekistondagi rasmiy importchisi" },
              { icon: "🚚", title: "Bepul yetkazib berish", desc: "Butun O'zbekiston bo'ylab — qishloqlarga ham yetkaziladi" },
              { icon: "👨‍⚕️", title: "Professional maslahat", desc: "Tajribali menejerlar har bir mahsulot bo'yicha tushuntiradi" },
              { icon: "🔒", title: "Sifat kafolati", desc: "Faqat original mahsulotlar, soxta yo'q" },
            ].map((f, i) => (
              <div key={i} className="observe-fade opacity-0 translate-y-8 transition-all duration-700 bg-white p-8 rounded-3xl border border-slate-200 text-center hover:-translate-y-2 hover:shadow-2xl">
                <div className="mx-auto mb-4 bg-gradient-to-br from-lampam-blue to-lampam-navy rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-lampam-blue/25 w-16 h-16">
                  {f.icon}
                </div>
                <h3 className="font-display text-lampam-navy text-lg font-bold mb-2.5">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-lampam-navy to-lampam-blue px-5 py-20 text-center text-white relative overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-blob-move bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.2)_0%,transparent_50%)]" />
        <div className="max-w-xl mx-auto relative z-10">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Mahsulot kerakmi? Maslahat oling!</h2>
          <p className="opacity-90 mb-8 text-base">Telefoningizni qoldiring va biz tez orada bog&apos;lanamiz</p>
          <Link href="/forma" className="inline-flex items-center gap-2.5 bg-white text-lampam-navy px-10 py-4 rounded-full font-bold text-base no-underline shadow-2xl hover:-translate-y-1 transition-all">
            Buyurtma berish →
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
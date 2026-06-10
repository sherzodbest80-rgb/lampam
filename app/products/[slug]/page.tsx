import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getProductBySlug, getSimilarProducts, products, formatPrice } from "@/lib/products";

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const similar = getSimilarProducts(slug, product.category, 3);

  return (
    <>
      <Header />

      {/* BREADCRUMB */}
      <div className="max-w-7xl mx-auto px-5 pt-5 flex items-center gap-2 text-sm text-slate-500 flex-wrap">
        <Link href="/" className="text-slate-500 no-underline hover:text-lampam-blue">Bosh sahifa</Link>
        <span className="text-slate-300">›</span>
        <span className="text-slate-500">{product.categoryLabel}</span>
        <span className="text-slate-300">›</span>
        <span className="text-lampam-navy font-semibold">{product.name}</span>
      </div>

      {/* PRODUCT HERO */}
      <section className="max-w-7xl mx-auto px-5 py-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="relative bg-white rounded-3xl border border-slate-200 h-[500px] flex items-center justify-center p-10 overflow-hidden shadow-xl shadow-lampam-navy/5">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(0,102,179,0.05)_0%,transparent_70%)]" />
          <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
            <span className="bg-gradient-to-br from-red-500 to-red-700 text-white px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider">🇹🇭 THAILAND</span>
            <span className="bg-gradient-to-br from-lampam-green to-emerald-600 text-white px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider">✓ ORIGINAL</span>
          </div>
          <Image src={product.image} alt={product.name} width={400} height={400} className="max-w-full max-h-full object-contain animate-float-y relative z-1" />
        </div>

        <div>
          <span className="inline-flex items-center gap-2 bg-red-50 text-red-700 text-xs font-bold px-3.5 py-1.5 rounded-full mb-4 tracking-wider">
            {product.categoryEmoji} {product.categoryLabel.toUpperCase()}
          </span>
          <h1 className="font-display text-4xl md:text-5xl text-lampam-navy font-extrabold mb-2 tracking-tight">{product.name}</h1>
          <span className="inline-block text-lampam-blue bg-blue-50 text-sm font-bold px-3.5 py-1.5 rounded-full mb-4">📦 {product.size}</span>
          
          {/* PRICE */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-5 mb-6 border-2 border-blue-100">
            <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1.5">Narxi</div>
            <div className="font-display text-3xl md:text-4xl text-lampam-navy font-extrabold tracking-tight">
              {formatPrice(product.price)}
            </div>
          </div>

          <p className="text-lg text-slate-600 mb-6 leading-relaxed">{product.tagline}</p>

          <div className="bg-slate-50 rounded-2xl p-6 mb-7">
            {product.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-3 mb-3.5 last:mb-0">
                <div className="w-6 h-6 bg-lampam-green text-white rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0 mt-0.5">✓</div>
                <div className="text-sm text-slate-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: h.text }} />
              </div>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link href={`/forma?product=${encodeURIComponent(product.name)}`} className="flex-1 min-w-[200px] bg-gradient-to-br from-lampam-blue to-lampam-navy text-white px-7 py-4 rounded-2xl font-bold text-base no-underline text-center shadow-xl shadow-lampam-blue/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
              Buyurtma berish →
            </Link>
            <a href="tel:+998500249898" className="bg-white text-lampam-navy px-7 py-4 border-2 border-slate-200 rounded-2xl font-bold text-base no-underline hover:border-lampam-blue hover:text-lampam-blue transition-all flex items-center gap-2">
              📞 Qo&apos;ng&apos;iroq
            </a>
          </div>
        </div>
      </section>

      {/* DETAILS */}
      <section className="bg-white px-5 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-50 rounded-2xl p-7 border border-slate-200 hover:border-lampam-blue hover:-translate-y-1 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-lampam-blue to-lampam-navy rounded-2xl flex items-center justify-center text-2xl mb-4">💡</div>
              <h3 className="font-display text-lampam-navy text-lg font-bold mb-2.5">Nima foyda beradi?</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{product.benefits}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-7 border border-slate-200 hover:border-lampam-blue hover:-translate-y-1 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-lampam-blue to-lampam-navy rounded-2xl flex items-center justify-center text-2xl mb-4">🎯</div>
              <h3 className="font-display text-lampam-navy text-lg font-bold mb-2.5">Qaysi muammoga yechim?</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{product.problems}</p>
            </div>
          </div>

          {product.usage && (
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border-2 border-blue-100 mb-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-lampam-green to-emerald-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-lampam-green/30">📋</div>
                <h3 className="font-display text-lampam-navy text-xl font-extrabold">Qanday qo&apos;llash kerak?</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div className="bg-white rounded-xl p-4 border border-blue-100">
                  <div className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">Miqdor</div>
                  <div className="text-lampam-navy font-bold text-sm">{product.usage.amount}</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-blue-100">
                  <div className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">Kuniga</div>
                  <div className="text-lampam-navy font-bold text-sm">{product.usage.perDay}</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-blue-100">
                  <div className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">Davomiyligi</div>
                  <div className="text-lampam-navy font-bold text-sm">{product.usage.duration}</div>
                </div>
              </div>
              <div className="text-sm text-slate-500 italic bg-yellow-50 p-4 rounded-xl border-l-4 border-yellow-500">
                ⚠️ <strong>Eslatma:</strong> {product.usage.note}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SIMILAR */}
      {similar.length > 0 && (
        <section className="bg-slate-50 px-5 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-block text-lampam-blue text-xs font-bold tracking-widest mb-3 uppercase">XUDDI SHU KATEGORIYA</div>
              <h2 className="font-display text-2xl md:text-3xl text-lampam-navy font-extrabold tracking-tight">O&apos;xshash mahsulotlar</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar.map((p) => (
                <Link key={p.slug} href={`/products/${p.slug}`} className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:border-lampam-blue transition-all no-underline group flex flex-col">
                  <div className="bg-white h-56 flex items-center justify-center p-5">
                    <Image src={p.image} alt={p.name} width={250} height={250} className="max-w-full max-h-full object-contain animate-float-y group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-5">
                    <span className="inline-block bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full mb-2.5">{p.categoryEmoji} {p.categoryLabel.toUpperCase()}</span>
                    <h3 className="font-display text-lg text-lampam-navy font-bold mb-1">{p.name}</h3>
                    <div className="text-slate-500 text-sm mb-2 font-medium">{p.size}</div>
                    <div className="font-display text-xl text-lampam-navy font-extrabold mb-3">{formatPrice(p.price)}</div>
                    <span className="block bg-lampam-blue text-white py-2.5 rounded-xl text-center font-semibold text-sm">Batafsil →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
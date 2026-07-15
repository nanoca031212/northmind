import { getProductsByCollection } from "@/lib/data-loader";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Fashion Collection | North Mind",
  description: "Explore our premium Fashion collections — Outerwear and Silent Warmth. British heritage craftsmanship for the modern man.",
  openGraph: {
    title: "Fashion | North Mind",
    description: "Outerwear & Silent Warmth — premium British heritage menswear.",
    type: "website",
  },
};

export default async function FashionCollectionPage() {
  const [outerwear, silentWarmth] = await Promise.all([
    getProductsByCollection("Outerwear"),
    getProductsByCollection("Silent Warmth"),
  ]);

  const products = [...outerwear, ...silentWarmth];

  return (
    <>
      <div className="min-h-screen bg-[#000000] text-white light:bg-white light:text-black">
        <div className="max-w-[1400px] mx-auto pt-10 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <nav className="text-[11px] uppercase tracking-widest text-white mb-6 flex items-center gap-3 light:text-black">
              <Link href="/" className="hover:text-white transition-colors light:hover:text-black">
                Home
              </Link>
              <ChevronRight size={10} />
              <span className="text-accent font-bold">Fashion</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none light:text-black">
                  Fashion
                </h1>
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/30 mt-2 light:text-black/30">
                  Outerwear &amp; Silent Warmth
                </p>
              </div>
              <p className="text-[13px] font-medium text-accent uppercase tracking-widest">
                {products.length} {products.length === 1 ? "Product" : "Products"}
              </p>
            </div>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center border border-dashed border-white/10 light:border-black/10">
              <h3 className="text-xl font-bold text-white light:text-black">No products available.</h3>
              <Link
                href="/"
                className="mt-6 inline-flex h-10 items-center justify-center bg-white/5 text-white px-6 text-[11px] uppercase font-bold tracking-widest hover:bg-white/10 transition-colors light:bg-black/5 light:text-black light:hover:bg-black/10"
              >
                Return Home
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

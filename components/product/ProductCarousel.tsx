"use client";

import Link from "next/link";
import { Product } from "@/lib/data-loader";
import { ProductCard } from "../ProductCard";

interface ProductCarouselProps {
  products: Product[];
  title: string;
  collection: string;
}

export function ProductCarousel({ products, title, collection }: ProductCarouselProps) {
  if (products.length === 0) return null;

  const href = `/collections/${encodeURIComponent(collection.toLowerCase().replace(/ /g, "-"))}`;

  return (
    <section className="pt-12 pb-2 px-2 md:px-8 max-w-[1600px] mx-auto w-full">
      <div className="flex items-end justify-between mb-8 md:mb-12 pb-4">
        <Link href={href} className="space-y-1 block group">
          <span className="text-[9px] uppercase font-black tracking-[0.5em] text-accent/60 pl-2 group-hover:text-accent transition-colors">
            Heritage Collection
          </span>
          <h2 className="text-4xl md:text-6xl font-light uppercase tracking-tighter text-white px-1 leading-none italic light:text-black group-hover:text-accent transition-colors">
            {title.split(' ').slice(0, -1).join(' ')} <span className="font-bold not-italic">{title.split(' ').slice(-1)}</span>
          </h2>
        </Link>
      </div>

      {/* Product List */}
      <div className="flex flex-row flex-wrap gap-3 sm:gap-4">
        {products.map((product, index) => (
          <div key={product.id} className="w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.667rem)] lg:w-[300px] xl:w-[340px]">
            <ProductCard product={product} index={index} />
          </div>
        ))}
      </div>
    </section>
  );
}

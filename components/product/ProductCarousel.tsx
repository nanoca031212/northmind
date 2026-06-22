"use client";

import { Product } from "@/lib/data-loader";
import { ProductCard } from "../ProductCard";

interface ProductCarouselProps {
  products: Product[];
  title: string;
  collection: string;
}

export function ProductCarousel({ products, title }: ProductCarouselProps) {
  if (products.length === 0) return null;

  return (
    <section className="pt-12 pb-2 px-2 md:px-8 max-w-[1600px] mx-auto w-full">
      <div className="flex items-end justify-between mb-8 md:mb-12 pb-4">
        <div className="space-y-1">
          <span className="text-[9px] uppercase font-black tracking-[0.5em] text-accent/60 pl-2">
            Heritage Collection
          </span>
          <h2 className="text-4xl md:text-6xl font-light uppercase tracking-tighter text-white px-1 leading-none italic">
            {title.split(' ').slice(0, -1).join(' ')} <span className="font-bold not-italic">{title.split(' ').slice(-1)}</span>
          </h2>
        </div>
      </div>

      {/* Product List */}
      <div className="flex flex-row flex-wrap gap-3 md:gap-4">
        {products.map((product, index) => (
          <div key={product.id} className="w-[calc(50%-0.375rem)] md:w-[300px] lg:w-[340px]">
            <ProductCard product={product} index={index} />
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/data-loader";
import { useState, useEffect, useRef, useCallback } from "react";
import { CarouselDots } from "./CarouselDots";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WorldCupGridProps {
  products: Product[];
  title: string;
  firstWordOnly?: boolean;
}

export function WorldCupGrid({ products, title, firstWordOnly = false }: WorldCupGridProps) {
  const [active, setActive] = useState(0);
  const touchStartX = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const titleWords = title.split(" ");
  const lastWord = titleWords.slice(-1).join(" ");
  const leadWords = titleWords.slice(0, -1).join(" ");

  // Desktop shows 4 cards at a time
  const desktopMax = Math.max(0, products.length - 4);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % products.length);
    }, 3000);
  }, [products.length]);

  const goTo = useCallback(
    (idx: number) => {
      setActive(((idx % products.length) + products.length) % products.length);
      resetTimer();
    },
    [products.length, resetTimer],
  );

  useEffect(() => {
    if (products.length < 2) return;
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer, products.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) goTo(active + (delta > 0 ? 1 : -1));
  };

  if (products.length === 0) return null;

  const desktopActive = Math.min(active, desktopMax);

  const ProductCard = ({ product, i, aspectRatio = "4/5" }: { product: Product; i: number; aspectRatio?: string }) => (
    <Link
      href={`/product/${product.handle}`}
      className="group relative block overflow-hidden"
    >
      <div className="relative overflow-hidden" style={{ aspectRatio }}>
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-zinc-950" />
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/25 via-zinc-950 to-black" />
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage: `radial-gradient(ellipse at ${i % 2 === 0 ? "30% 35%" : "70% 60%"}, rgba(197,163,88,0.22) 0%, transparent 52%)`,
              }}
            />
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="absolute bottom-0 inset-x-0 p-5 md:p-8 z-10">
          <p className="text-[9px] uppercase tracking-[0.5em] text-accent font-black mb-2">
            World Cup Edition
          </p>
          <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight text-white mb-1 leading-tight group-hover:text-accent transition-colors duration-500">
            {firstWordOnly ? product.title.split(" ")[0] : product.title}
          </h3>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-6">
            {product.collection}
          </p>
        </div>
      </div>
    </Link>
  );

  return (
    <section className="pt-12 pb-2 px-2 md:px-8 max-w-[1600px] mx-auto w-full">
      {/* Título da coleção */}
      <div className="flex items-end justify-between mb-8 md:mb-12 pb-4">
        <div className="space-y-1">
          <span className="text-[9px] uppercase font-black tracking-[0.5em] text-accent/60 pl-2">
            World Cup Edition
          </span>
          <h2 className="text-4xl md:text-6xl font-light uppercase tracking-tighter text-white px-1 leading-none italic">
            {leadWords}
            {leadWords ? " " : ""}
            <span className="font-bold not-italic">{lastWord}</span>
          </h2>
        </div>
      </div>

      {/* Mobile — 1 card por slide */}
      <div
        className="md:hidden overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {products.map((product, i) => (
            <div key={product.id} className="w-full flex-shrink-0">
              <ProductCard product={product} i={i} />
            </div>
          ))}
        </div>
        {products.length > 1 && (
          <CarouselDots total={products.length} active={active} goTo={goTo} />
        )}
      </div>

      {/* Desktop — 2 cards visíveis com setas */}
      <div className="hidden md:block">
        <div className="relative">
          {desktopActive > 0 && (
            <button
              onClick={() => goTo(active - 1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-10 h-10 flex items-center justify-center bg-black/60 border border-white/10 text-white/60 hover:bg-black hover:text-white hover:border-white/30 transition-all duration-300"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          {desktopActive < desktopMax && (
            <button
              onClick={() => goTo(active + 1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 w-10 h-10 flex items-center justify-center bg-black/60 border border-white/10 text-white/60 hover:bg-black hover:text-white hover:border-white/30 transition-all duration-300"
            >
              <ChevronRight size={18} />
            </button>
          )}

          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${desktopActive * 25}%)` }}
            >
              {products.map((product, i) => (
                <div
                  key={product.id}
                  className={`w-[25%] flex-shrink-0 ${i < products.length - 1 ? "pr-4" : ""}`}
                >
                  <ProductCard product={product} i={i} aspectRatio="4/5" />
                </div>
              ))}
            </div>
          </div>
        </div>
        {products.length > 4 && (
          <CarouselDots total={products.length} active={active} goTo={goTo} />
        )}
      </div>
    </section>
  );
}

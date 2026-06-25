"use client";

import { useSearchParams } from "next/navigation";
import { ProductCarousel } from "./ProductCarousel";
import { WorldCupGrid } from "./WorldCupGrid";
import { Product } from "@/lib/data-loader";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { CarouselDots } from "./CarouselDots";

interface ThemeAwareCollectionProps {
  products: Product[];
  title: string;
  collection: string;
  index: number;
}

const HERO_CARDS = [
  {
    title: "World Cup",
    label: "Collection",
    href: "/?theme=worldcup",
    accent: "25% 35%",
  },
  {
    title: "Limited Edition",
    label: "Explore",
    href: "/collections/fashion",
    accent: "75% 60%",
  },
] as const;

const CATEGORY_CARDS = [
  { label: "WorldCup", href: "/?theme=worldcup", accent: "30% 40%" },
  { label: "Fashion", href: "/collections/fashion", accent: "50% 30%" },
  { label: "Perfume", href: "/collections/fragrances", accent: "70% 55%" },
] as const;

function CategoryCardInner({ cat }: { cat: (typeof CATEGORY_CARDS)[number] }) {
  return (
    <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
      <div className="absolute inset-0 bg-zinc-950" />
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/20 via-zinc-950 to-black" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(ellipse at ${cat.accent}, rgba(197,163,88,0.18) 0%, transparent 55%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 8px)",
        }}
      />
      <div className="absolute bottom-4 left-4 z-10">
        <span className="text-xs md:text-md uppercase tracking-[0.35em] font-black text-white/30 border border-white/10 px-3 py-1.5 group-hover:text-white/60 group-hover:border-white/25 transition-all duration-300">
          {cat.label}
        </span>
      </div>
    </div>
  );
}

function WorldCupCategoryNav() {
  const [active, setActive] = useState(0);
  const touchStartX = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % CATEGORY_CARDS.length);
    }, 3000);
  }, []);

  const goTo = useCallback(
    (idx: number) => {
      setActive(
        ((idx % CATEGORY_CARDS.length) + CATEGORY_CARDS.length) %
          CATEGORY_CARDS.length,
      );
      resetTimer();
    },
    [resetTimer],
  );

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) {
      goTo(active + (delta > 0 ? 1 : -1));
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full pt-12 px-2 md:px-8">

      {/* 2 large hero cards — 50/50 desktop, stacked mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mb-3 md:mb-4">
        {HERO_CARDS.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group relative block overflow-hidden"
          >
            <div className="relative overflow-hidden" style={{ aspectRatio: "4/5" }}>
              <div className="absolute inset-0 bg-zinc-950" />
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/20 via-zinc-950 to-black" />
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(ellipse at ${card.accent}, rgba(197,163,88,0.18) 0%, transparent 55%)`,
                }}
              />
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 8px)",
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-base md:text-2xl font-black uppercase tracking-tight text-white leading-tight mb-3">
                  {card.title}
                </h3>
                <span className="text-[8px] md:text-[9px] uppercase tracking-[0.35em] font-black text-white/30 border border-white/10 px-3 py-1.5 group-hover:text-white/60 group-hover:border-white/25 transition-all duration-300">
                  {card.label}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile — carousel, 1 card at a time */}
      <div
        className="md:hidden overflow-hidden mt-10"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {CATEGORY_CARDS.map((cat) => (
            <div key={cat.label} className="w-full flex-shrink-0">
              <Link href={cat.href} className="group relative block overflow-hidden">
                <CategoryCardInner cat={cat} />
              </Link>
            </div>
          ))}
        </div>

        <CarouselDots total={CATEGORY_CARDS.length} active={active} goTo={goTo} />
      </div>

      {/* Desktop — 3-column grid */}
      <div className="hidden md:grid grid-cols-3 gap-3 md:gap-4">
        {CATEGORY_CARDS.map((cat) => (
          <Link
            key={cat.label}
            href={cat.href}
            className="group relative block overflow-hidden"
          >
            <CategoryCardInner cat={cat} />
          </Link>
        ))}
      </div>

    </div>
  );
}

export function ThemeAwareCollection({
  products,
  title,
  collection,
  index,
}: ThemeAwareCollectionProps) {
  const searchParams = useSearchParams();
  const isWorldCup = searchParams.get("theme") === "worldcup";

  if (isWorldCup) {
    const isWorldCupCollection =
      collection.toLowerCase().includes("world") ||
      title.toLowerCase().includes("world");

    return (
      <>
        {index === 0 && <WorldCupCategoryNav />}
        {isWorldCupCollection ? (
          <WorldCupGrid products={products} title={title} />
        ) : (
          <ProductCarousel
            products={products}
            title={title}
            collection={collection}
          />
        )}
      </>
    );
  }

  return (
    <ProductCarousel
      products={products}
      title={title}
      collection={collection}
    />
  );
}

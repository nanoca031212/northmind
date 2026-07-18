"use client";

import { useSearchParams } from "next/navigation";
import { ProductCarousel } from "./ProductCarousel";
import { WorldCupGrid } from "./WorldCupGrid";
import { Product } from "@/lib/data-loader";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { CarouselDots } from "./CarouselDots";

interface ThemeAwareCollectionProps {
  products: Product[];
  title: string;
  collection: string;
  index: number;
  worldCupHeroImage?: string;
  limitedEditionHeroImage?: string;
  categoryCardImages?: (string | undefined)[];
  outerwearProducts?: Product[];
  silentWarmthProducts?: Product[];
  eyewearProducts?: Product[];
  pradaProducts?: Product[];
  fragranceProducts?: Product[];
}

const HERO_CARDS = [
  {
    title: "World Cup",
    label: "Collection",
    href: "/collections/world-cup",
    accent: "25% 35%",
  },
] as const;

const CATEGORY_CARDS = [
  { label: "WorldCup", href: "/collections/world-cup", accent: "30% 40%" },
  { label: "Fashion", href: "/collections/fashion", accent: "50% 30%" },
  { label: "Perfume", href: "/collections/fragrances", accent: "70% 55%" },
] as const;

function CategoryCardInner({
  cat,
  image,
}: {
  cat: (typeof CATEGORY_CARDS)[number];
  image?: string;
}) {
  return (
    <div className="relative overflow-hidden aspect-[3/3.7] md:aspect-[3/4]">
      {image ? (
        <Image
          src={image}
          alt={cat.label}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <>
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
        </>
      )}
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black to-transparent light:hidden" />
      <div className="absolute bottom-4 left-4 z-10">
        <span className="text-xs md:text-md uppercase tracking-[0.35em] font-black text-white/90 border border-white/10 px-3 py-1.5 group-hover:text-white group-hover:border-white/25 transition-all duration-300">
          {cat.label}
        </span>
      </div>
    </div>
  );
}

function WorldCupHeroCards({
  worldCupImage,
  limitedEditionImage,
}: {
  worldCupImage?: string;
  limitedEditionImage?: string;
}) {
  const heroImages = [worldCupImage, limitedEditionImage];

  return (
    <div className="max-w-[1600px] mx-auto w-full pt-12 px-2 md:px-8">
      <div className="grid grid-cols-1 gap-0 mb-3 md:mb-4">
        {HERO_CARDS.map((card, i) => {
          const imgSrc = heroImages[i];
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group relative block overflow-hidden"
            >
              <div className="relative overflow-hidden aspect-[3/1] md:aspect-[5/1]">
                {imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={card.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className={`object-cover transition-transform duration-700 group-hover:scale-105 ${i === 1 ? "object-top" : ""}`}
                  />
                ) : (
                  <>
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
                  </>
                )}
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black to-transparent light:hidden" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10">
                  <h3 className="text-base md:text-2xl font-black uppercase tracking-tight text-white leading-tight mb-3">
                    {card.title}
                  </h3>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function WorldCupCategoryCards({
  categoryCardImages = [],
}: {
  categoryCardImages?: (string | undefined)[];
}) {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
    <div
      className="max-w-[1600px] mx-auto w-full px-2 md:px-8 pb-12"
      ref={sectionRef}
    >
      <div className="flex items-end justify-between  my-8 md:my-12  pb-4">
        <div className="space-y-1">
          <h2 className="text-4xl md:text-6xl font-light uppercase tracking-tighter text-white px-1 leading-none italic light:text-black">
            other
            <span className="font-bold not-italic"> products</span>
          </h2>
        </div>
      </div>

      {/* Mobile — carousel, 1 card at a time */}
      <div
        className="md:hidden overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {CATEGORY_CARDS.map((cat, i) => (
            <div
              key={cat.label}
              className="w-full flex-shrink-0 px-5"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.6s ease ${i * 0.12}s, transform 0.6s ease ${i * 0.12}s`,
              }}
            >
              <Link
                href={cat.href}
                className="group relative block overflow-hidden"
              >
                <CategoryCardInner cat={cat} image={categoryCardImages[i]} />
              </Link>
            </div>
          ))}
        </div>

        <CarouselDots
          total={CATEGORY_CARDS.length}
          active={active}
          goTo={goTo}
        />
      </div>

      {/* Desktop — 3-column grid */}
      <div className="hidden md:grid grid-cols-3 gap-3 md:gap-4 mt-4">
        {CATEGORY_CARDS.map((cat, i) => (
          <Link
            key={cat.label}
            href={cat.href}
            className="group relative block overflow-hidden"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(24px)",
              transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`,
            }}
          >
            <CategoryCardInner cat={cat} image={categoryCardImages[i]} />
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
  worldCupHeroImage,
  limitedEditionHeroImage,
  categoryCardImages,
  outerwearProducts,
  silentWarmthProducts,
  eyewearProducts,
  pradaProducts,
  fragranceProducts,
}: ThemeAwareCollectionProps) {
  const searchParams = useSearchParams();
  const isWorldCup = searchParams.get("theme") === "worldcup";

  if (isWorldCup) {
    const isWorldCupCollection =
      collection.toLowerCase().includes("world") ||
      title.toLowerCase().includes("world");

    if (!isWorldCupCollection) return null;

    return (
      <>
        <WorldCupHeroCards
          worldCupImage={worldCupHeroImage}
          limitedEditionImage={limitedEditionHeroImage}
        />
        <WorldCupGrid products={products} title={title} firstWordOnly />
        <WorldCupCategoryCards categoryCardImages={categoryCardImages} />
        {outerwearProducts && outerwearProducts.length > 0 && (
          <WorldCupGrid
            products={outerwearProducts}
            title="Outerwear"
            editionLabel="Heritage Collection"
            stripWords={["the", "jacket", "down", "nuptse"]}
          />
        )}
        {silentWarmthProducts && silentWarmthProducts.length > 0 && (
          <WorldCupGrid
            products={silentWarmthProducts}
            title="Silent Warmth"
            editionLabel="Heritage Collection"
            stripWords={[
              "the",
              "jacket",
              "down",
              "nuptse",
              "polo",
              "jumper",
              "iconic",
              "(unisex)",
            ]}
            titleMap={{
              "Double-Knit Quarter-Zip Pullover": "Knit Pullover",
              "Cable-Knit Quarter-Zip Jumper": "Cable-Knit Jumper",
              "Cable-Knit Wool-Cashmere Jumper": "Cable-Knit",
            }}
          />
        )}
        {pradaProducts && pradaProducts.length > 0 && (
          <WorldCupGrid
            products={pradaProducts}
            title="Prada"
            editionLabel="Heritage Collection"
            autoPlay
          />
        )}
        {eyewearProducts && eyewearProducts.length > 0 && (
          <WorldCupGrid
            products={eyewearProducts}
            title="Eyewear"
            editionLabel="Heritage Collection"
            autoPlay
          />
        )}
        {fragranceProducts && fragranceProducts.length > 0 && (
          <WorldCupGrid
            products={fragranceProducts}
            title="Fragrances"
            editionLabel="Signature Scents"
            firstWordOnly
            autoPlay
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

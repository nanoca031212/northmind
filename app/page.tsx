import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { getCollections, getProductsByCollection } from "@/lib/data-loader";

// Lazy loading components below the fold
const ThemeAwareCollection = dynamic(() => import("@/components/product/ThemeAwareCollection").then(mod => mod.ThemeAwareCollection), { ssr: true });
const Footer = dynamic(() => import("@/components/Footer").then(mod => mod.Footer), { ssr: true });
const ScrollingText = dynamic(() => import("@/components/effects/mobile/ScrollingText").then(mod => mod.ScrollingText), { ssr: true });
const VideoSection = dynamic(() => import("@/components/VideoSection").then(mod => mod.VideoSection), { ssr: true });

export const revalidate = 3600; // Cache de 1 hora para a home

async function HomeCollections() {
  const collections = await getCollections();

  // Sort collections to put Fragrances/Fragrance first
  const sortedCollections = [...collections].sort((a, b) => {
    if (a.name.toLowerCase().includes('3x1 fragrances')) return -1;
    if (b.name.toLowerCase().includes('3x1 fragrances')) return 1;
    return 0;
  });

  // Prada gets its own collection but should stay right above Eyewear
  const pradaIndex = sortedCollections.findIndex((c) => c.handle === "prada");
  const eyewearIndex = sortedCollections.findIndex((c) => c.handle === "eyewear");
  if (pradaIndex !== -1 && eyewearIndex !== -1 && pradaIndex > eyewearIndex) {
    const [prada] = sortedCollections.splice(pradaIndex, 1);
    sortedCollections.splice(eyewearIndex, 0, prada);
  }

  // Fetch products for all collections + outerwear separately
  const [collectionsWithProducts, outerwearProducts, silentWarmthProducts, eyewearProducts, pradaProducts, fragranceProducts] = await Promise.all([
    Promise.all(
      sortedCollections.map(async (c) => {
        const products = await getProductsByCollection(c.name);
        return { ...c, products };
      })
    ),
    getProductsByCollection("Outerwear"),
    getProductsByCollection("Silent Warmth"),
    getProductsByCollection("Eyewear"),
    getProductsByCollection("Prada"),
    getProductsByCollection("Fragrances"),
  ]);

  if (collectionsWithProducts.length === 0) {
    return (
      <div className="py-20 text-center text-white/20 uppercase tracking-luxury">
        Discovering our heritage...
      </div>
    );
  }

  // Hero card images
  const worldCupHeroImage = "/Card/cardcopa.png";
  const limitedEditionHeroImage = "/Card/card2.png";

  // Category card images
  const allProducts = collectionsWithProducts.flatMap((c) => c.products);
  const worldCupCatImage = allProducts.find(
    (p) =>
      p.collection.toLowerCase().includes("world") ||
      p.title.toLowerCase().includes("world")
  )?.images?.[1];
  const gorhamCatImage = allProducts.find((p) =>
    p.title.toLowerCase().includes("gorham")
  )?.images?.[1];
  const armafCatImage = allProducts.find(
    (p) =>
      p.title.toLowerCase().includes("armaf") ||
      p.title.toLowerCase().includes("club de nuit") ||
      p.title.toLowerCase().includes("intercen") ||
      p.title.toLowerCase().includes("intense")
  )?.images?.[0];
  const categoryCardImages: (string | undefined)[] = [
    worldCupCatImage,
    gorhamCatImage,
    armafCatImage,
  ];

  return (
    <>
      {collectionsWithProducts.map((c, index) => (
        <div key={c.handle}>
          <ThemeAwareCollection
            title={c.name}
            collection={c.name}
            products={c.products}
            index={index}
            worldCupHeroImage={worldCupHeroImage}
            limitedEditionHeroImage={limitedEditionHeroImage}
            categoryCardImages={categoryCardImages}
            outerwearProducts={outerwearProducts}
            silentWarmthProducts={silentWarmthProducts}
            eyewearProducts={eyewearProducts}
            pradaProducts={pradaProducts}
            fragranceProducts={fragranceProducts}
          />
        </div>
      ))}
    </>
  );
}

// Local collection photos in public/collections, keyed by collection handle.
const LOCAL_COLLECTION_IMAGES: Record<string, string> = {
  "world-cup": "/collections/world-cup-brazil.png",
  outerwear: "/collections/jackets.png",
  "silent-warmth": "/collections/silent-warmth.png",
  fragrances: "/collections/3x1-fragrances-banner.png",
  eyewear: "/collections/kits.png",
  "t-shirts": "/collections/t-shirts.png",
  "special-promo": "/collections/special-promo.png",
  kits: "/collections/kits.png",
};

async function CollectionsShowcase() {
  const collections = await getCollections();

  const items = collections
    .map((c) => ({
      text: c.name,
      href: `/collections/${c.handle}`,
      image: LOCAL_COLLECTION_IMAGES[c.handle] || c.image,
    }))
    .filter((i) => i.image);

  // World Cup isn't guaranteed to have a dedicated collection image, so
  // fall back to a product image — but only if it isn't already present
  // above (it now has its own image, which was causing a duplicate entry).
  const hasWorldCup = items.some((i) => i.text.toLowerCase().includes("world"));
  if (!hasWorldCup) {
    const worldCupCollection = collections.find(
      (c) =>
        c.name.toLowerCase().includes("world") ||
        c.handle.toLowerCase().includes("world"),
    );
    if (worldCupCollection) {
      const worldCupProducts = await getProductsByCollection(worldCupCollection.name);
      // Same product/image picked for the World Cup category card elsewhere on the page.
      const worldCupProduct = worldCupProducts.find(
        (p) =>
          p.collection.toLowerCase().includes("world") ||
          p.title.toLowerCase().includes("world"),
      ) || worldCupProducts[0];
      const worldCupImage = worldCupProduct?.images?.[1] || worldCupProduct?.images?.[0];
      if (worldCupImage) {
        items.unshift({
          text: worldCupCollection.name,
          href: `/collections/${worldCupCollection.handle}`,
          image: worldCupImage,
        });
      }
    }
  }

  if (items.length === 0) return null;

  return <VideoSection items={items} />;
}

function CollectionsSkeleton() {
  return (
    <div className="py-24 space-y-12">
      <div className="text-center space-y-4">
        <div className="h-4 bg-white/5 w-48 mx-auto rounded animate-pulse" />
        <div className="h-8 bg-white/10 w-64 mx-auto rounded animate-pulse" />
      </div>
      <div className="flex gap-4 px-4 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="min-w-[280px] md:min-w-[320px] aspect-[3/4] bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-black light:bg-white" suppressHydrationWarning>
      <Header overHero />
      <Hero />
      <ScrollingText />

      <div id="collections" className="space-y-0">
        <Suspense fallback={<CollectionsSkeleton />}>
          <HomeCollections />
        </Suspense>
      </div>

      <Suspense fallback={null}>
        <CollectionsShowcase />
      </Suspense>

      <Footer />
    </main>
  );
}

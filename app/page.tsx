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

  // Fetch products for all collections + outerwear separately
  const [collectionsWithProducts, outerwearProducts, silentWarmthProducts, fragranceProducts] = await Promise.all([
    Promise.all(
      sortedCollections.map(async (c) => {
        const products = await getProductsByCollection(c.name);
        return { ...c, products };
      })
    ),
    getProductsByCollection("Outerwear"),
    getProductsByCollection("Silent Warmth"),
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
            fragranceProducts={fragranceProducts}
          />
        </div>
      ))}
    </>
  );
}

async function CollectionsShowcase() {
  const collections = await getCollections();

  const items = collections
    .filter((c) => c.image)
    .map((c) => ({
      text: c.name,
      href: `/collections/${c.handle}`,
      image: c.image,
    }));

  // World Cup isn't one of the core seeded collections (no dedicated image
  // in public/collections), so reuse the same product image used for the
  // World Cup card in the "other products" category grid.
  const worldCupCollection = collections.find(
    (c) =>
      c.name.toLowerCase().includes("world") ||
      c.handle.toLowerCase().includes("world"),
  );
  if (worldCupCollection) {
    const worldCupProducts = await getProductsByCollection(worldCupCollection.name);
    const worldCupImage = worldCupProducts[0]?.images?.[1] || worldCupProducts[0]?.images?.[0];
    if (worldCupImage) {
      items.unshift({
        text: worldCupCollection.name,
        href: `/collections/${worldCupCollection.handle}`,
        image: worldCupImage,
      });
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

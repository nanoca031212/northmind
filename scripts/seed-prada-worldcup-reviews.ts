import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const REVIEWER_NAMES = [
  "Harry T.", "Mia B.", "Arthur P.", "George D.", "Thomas S.",
  "Oliver S.", "Leo F.", "Elena R.", "James W.", "Sophia L.",
  "Marcus K.", "Isla M.", "Freddie N.", "Charlotte H.", "Jack R.",
  "Amelia W.", "Ethan C.", "Grace P.",
];

const PRADA_REVIEWS: { rating: number; text: string }[] = [
  { rating: 5, text: "The acetate quality is incredible — feels exactly like the pair I tried on in the boutique." },
  { rating: 5, text: "Lightweight yet sturdy, and the Prada logo detailing is spot on. Gets compliments every time I wear them." },
  { rating: 5, text: "UV protection is excellent and they're genuinely comfortable for all-day wear." },
  { rating: 5, text: "Packaging alone felt like a luxury unboxing experience. The frame fit my face perfectly." },
  { rating: 5, text: "Bought these for a summer holiday and they photographed beautifully — sharp, modern silhouette." },
  { rating: 4, text: "The faceted temple detail is such a nice touch, you can tell it's proper craftsmanship." },
  { rating: 5, text: "Exactly as pictured, arrived well packaged, and the lenses are noticeably premium." },
  { rating: 5, text: "My second pair from this collection — consistent quality and fast delivery to London." },
  { rating: 5, text: "Sturdy hinges, no wobble, and the tint is perfect for everyday sun protection." },
  { rating: 4, text: "Sleek, bold, and versatile — works with both casual and smart outfits." },
];

const JERSEY_REVIEWS: { rating: number; text: string }[] = [
  { rating: 5, text: "Wore this to the match day screening and the fit was spot on — proper matchday quality." },
  { rating: 5, text: "Fabric is breathable and true to size. Perfect for showing support all tournament long." },
  { rating: 5, text: "The colours are exactly like the official kit, no fading after a few washes." },
  { rating: 5, text: "Ordered ahead of the World Cup and it arrived in plenty of time — great tailoring too." },
  { rating: 5, text: "Lightweight and comfortable, wore it all day at the fan zone without any issues." },
  { rating: 4, text: "Great gift for a supporter in the family, quality feels premium for the price." },
  { rating: 5, text: "The print detailing held up really well after multiple wears." },
  { rating: 5, text: "Fits true to size, sleeve length is perfect, exactly what I wanted for matchday." },
  { rating: 5, text: "Delivery was quick and the shirt looks even better in person." },
  { rating: 4, text: "Solid build quality, I'll definitely be getting jerseys for the other teams too." },
];

async function main() {
  console.log("Seeding reviews for Prada and World Cup products...");

  const systemUser = await prisma.user.upsert({
    where: { email: "customer@northmind.store" },
    update: {},
    create: {
      email: "customer@northmind.store",
      name: "Elite Customer",
    },
  });

  const products = await prisma.produto.findMany({
    where: { collection: { in: ["Prada", "World Cup"] } },
  });

  console.log(`Found ${products.length} product(s) to seed.`);

  let seededTotal = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const pool = p.collection === "Prada" ? PRADA_REVIEWS : JERSEY_REVIEWS;

    const existingCount = await prisma.comentario.count({ where: { produtoId: p.id } });
    if (existingCount > 0) {
      console.log(`Skipping "${p.nome}" (${p.handle}): already has ${existingCount} review(s).`);
      continue;
    }

    for (let j = 0; j < pool.length; j++) {
      const review = pool[j];
      const userName = REVIEWER_NAMES[(i * 3 + j) % REVIEWER_NAMES.length];
      const daysAgo = 180 - j * 17 - i * 5;
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      await prisma.comentario.create({
        data: {
          rating: review.rating,
          texto: review.text,
          userName,
          produtoId: p.id,
          userId: systemUser.id,
          createdAt,
        },
      });
      seededTotal++;
    }

    console.log(`Seeded ${pool.length} review(s) for "${p.nome}" (${p.handle}).`);
  }

  console.log(`\nDone. Seeded ${seededTotal} review(s) total.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

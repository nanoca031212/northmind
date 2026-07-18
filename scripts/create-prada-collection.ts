import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COLLECTION_NAME = "Prada";
const COLLECTION_HANDLE = "prada";

const PRADA_HANDLES = [
  "prada-symbole",
  "prada-symbole-2",
  "prada-symbole-3",
  "prada-symbole-4",
  "prada-symbole-5",
];

async function main() {
  console.log(`Upserting collection "${COLLECTION_NAME}"...`);
  await prisma.collection.upsert({
    where: { handle: COLLECTION_HANDLE },
    update: { name: COLLECTION_NAME },
    create: {
      name: COLLECTION_NAME,
      handle: COLLECTION_HANDLE,
      description: "Prada eyewear frames.",
    },
  });

  const { count } = await prisma.produto.updateMany({
    where: { handle: { in: PRADA_HANDLES } },
    data: { collection: COLLECTION_NAME },
  });
  console.log(`Moved ${count} product(s) from Eyewear to "${COLLECTION_NAME}".`);

  const firstProduct = await prisma.produto.findFirst({
    where: { handle: { in: PRADA_HANDLES } },
    orderBy: { handle: "asc" },
  });
  if (firstProduct?.fotoPrincipal) {
    await prisma.collection.update({
      where: { handle: COLLECTION_HANDLE },
      data: { image: firstProduct.fotoPrincipal },
    });
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

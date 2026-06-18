import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as fs from "fs";
import * as path from "path";
import crypto from "crypto";

const prisma = new PrismaClient();

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME || "northmind";
const PUBLIC_URL = (process.env.R2_PUBLIC_URL || "").replace(/\/+$/, "");

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

const CAMISAS_DIR = path.join(process.cwd(), "camisas");
const COLLECTION_NAME = "World Cup";
const COLLECTION_HANDLE = "world-cup";

interface JerseyJson {
  slug: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice: number;
  variants: { size: string; available: boolean }[];
  country?: string;
}

function sortImageFiles(files: string[]): string[] {
  return files.sort((a, b) => {
    const numA = parseInt(a.match(/^(\d+)/)?.[1] || "", 10);
    const numB = parseInt(b.match(/^(\d+)/)?.[1] || "", 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    if (!isNaN(numA)) return -1;
    if (!isNaN(numB)) return 1;
    return a.localeCompare(b);
  });
}

async function uploadImage(filePath: string, slug: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
  const key = `products/world-cup/${slug}/${crypto.randomUUID()}${ext}`;
  const body = fs.readFileSync(filePath);

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));

  return `${PUBLIC_URL}/${key}`;
}

async function main() {
  if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    throw new Error("Missing R2 credentials in environment.");
  }

  console.log(`Upserting collection "${COLLECTION_NAME}"...`);
  await prisma.collection.upsert({
    where: { handle: COLLECTION_HANDLE },
    update: { name: COLLECTION_NAME },
    create: {
      name: COLLECTION_NAME,
      handle: COLLECTION_HANDLE,
      description: "Official 2026 World Cup national team jerseys.",
    },
  });

  const countryFolders = fs
    .readdirSync(CAMISAS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  let firstImageUrl: string | null = null;
  let importedCount = 0;

  for (const folder of countryFolders) {
    const folderPath = path.join(CAMISAS_DIR, folder);
    const entries = fs.readdirSync(folderPath);

    const jsonFile = entries.find((f) => f.toLowerCase().endsWith(".json"));
    if (!jsonFile) {
      console.warn(`Skipping "${folder}": no JSON file found.`);
      continue;
    }

    const data: JerseyJson = JSON.parse(fs.readFileSync(path.join(folderPath, jsonFile), "utf-8"));

    const imageFiles = sortImageFiles(
      entries.filter((f) => f !== jsonFile && /\.(jpg|jpeg|png|webp|avif)$/i.test(f))
    );

    if (imageFiles.length === 0) {
      console.warn(`Skipping "${folder}" (${data.slug}): no images found.`);
      continue;
    }

    console.log(`Uploading ${imageFiles.length} image(s) for "${data.title}"...`);
    const urls: string[] = [];
    for (const file of imageFiles) {
      const url = await uploadImage(path.join(folderPath, file), data.slug);
      urls.push(url);
    }

    if (!firstImageUrl) firstImageUrl = urls[0];

    const sizes = data.variants.filter((v) => v.available).map((v) => v.size);

    await prisma.produto.upsert({
      where: { handle: data.slug },
      update: {
        nome: data.title,
        descricao: data.description,
        preco: data.price,
        precoOriginal: data.compareAtPrice,
        collection: COLLECTION_NAME,
        fotos: urls,
        fotoPrincipal: urls[0],
        opcoesTamanho: sizes,
        publicado: true,
      },
      create: {
        nome: data.title,
        handle: data.slug,
        descricao: data.description,
        preco: data.price,
        precoOriginal: data.compareAtPrice,
        collection: COLLECTION_NAME,
        fotos: urls,
        fotoPrincipal: urls[0],
        opcoesTamanho: sizes,
        tipo: "ROUPA",
        publicado: true,
      },
    });

    console.log(`Upserted product: ${data.title} (${data.slug})`);
    importedCount++;
  }

  if (firstImageUrl) {
    await prisma.collection.update({
      where: { handle: COLLECTION_HANDLE },
      data: { image: firstImageUrl },
    });
  }

  console.log(`\nDone. ${importedCount} jersey(s) imported into "${COLLECTION_NAME}".`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Fatal import error:", err);
  await prisma.$disconnect();
  process.exit(1);
});

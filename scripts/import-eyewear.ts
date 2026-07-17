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
  ".mp4": "video/mp4",
};

const OCULOS_DIR = path.join(process.cwd(), "Oculos");
const COLLECTION_NAME = "Eyewear";
const COLLECTION_HANDLE = "eyewear";

// The James Oro "Architect" family was scraped from 3 different starting
// pages, so black-tint-architect/haze-architect/old-money-architect are the
// same frame in 3 colorways. black-tint-architect's own metadata already
// lists the other two as variations, so those two folders are skipped here.
const SKIP_FOLDERS = new Set(["haze-architect", "old-money-architect"]);

const SINGLE_PRICE = 39.9;
const DUO_PRICE = 69.9;
const TRIO_PRICE = 99.9;

interface MediaEntry {
  filename: string;
  originalUrl: string;
  alt: string;
  kind?: string;
}

interface VariationEntry {
  label: string;
  slug: string;
  name: string;
  description: string;
  images: MediaEntry[];
  videos: MediaEntry[];
}

interface EyewearMetadata {
  id: string;
  name: string;
  description: string;
  images: MediaEntry[];
  videos: MediaEntry[];
  variations: VariationEntry[];
}

async function uploadFile(filePath: string, handle: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
  const key = `products/eyewear/${handle}/${crypto.randomUUID()}${ext}`;
  const body = fs.readFileSync(filePath);

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));

  return `${PUBLIC_URL}/${key}`;
}

async function uploadMediaList(
  entries: MediaEntry[],
  dir: string,
  handle: string,
  label: string
): Promise<string[]> {
  const urls: string[] = [];
  for (const entry of entries) {
    const filePath = path.join(dir, entry.filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`  Missing file for ${label}: ${filePath}`);
      continue;
    }
    urls.push(await uploadFile(filePath, handle));
  }
  return urls;
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
      description: "Premium eyewear frames.",
    },
  });

  const productFolders = fs
    .readdirSync(OCULOS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => !SKIP_FOLDERS.has(name));

  let firstImageUrl: string | null = null;
  let importedCount = 0;

  for (const folder of productFolders) {
    const folderPath = path.join(OCULOS_DIR, folder);
    const metadataPath = path.join(folderPath, "metadata.json");

    if (!fs.existsSync(metadataPath)) {
      console.warn(`Skipping "${folder}": no metadata.json found.`);
      continue;
    }

    const data: EyewearMetadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
    const handle = folder;

    console.log(`Uploading ${data.images.length} image(s) / ${data.videos.length} video(s) for "${data.name}"...`);
    const mainImageUrls = await uploadMediaList(data.images, path.join(folderPath, "imagens"), handle, data.name);
    const mainVideoUrls = await uploadMediaList(data.videos, path.join(folderPath, "videos"), handle, data.name);

    if (mainImageUrls.length === 0) {
      console.warn(`Skipping "${folder}" (${handle}): no images uploaded.`);
      continue;
    }

    if (!firstImageUrl) firstImageUrl = mainImageUrls[0];

    const opcoesCor: { name: string; hex: string; image: string; fotos: string[] }[] = [
      {
        name: data.name,
        hex: "",
        image: mainImageUrls[0],
        fotos: mainImageUrls,
      },
    ];

    for (const variation of data.variations) {
      console.log(`  Uploading ${variation.images.length} image(s) for variation "${variation.name}"...`);
      const variationDir = path.join(folderPath, "variacoes", variation.slug, "imagens");
      const variationUrls = await uploadMediaList(variation.images, variationDir, handle, variation.name);
      if (variationUrls.length === 0) {
        console.warn(`  Skipping variation "${variation.name}": no images uploaded.`);
        continue;
      }
      opcoesCor.push({
        name: variation.name,
        hex: "",
        image: variationUrls[0],
        fotos: variationUrls,
      });
    }

    await prisma.produto.upsert({
      where: { handle },
      update: {
        nome: data.name,
        descricao: data.description,
        preco: SINGLE_PRICE,
        precoOriginal: SINGLE_PRICE,
        collection: COLLECTION_NAME,
        fotos: mainImageUrls,
        fotoPrincipal: mainImageUrls[0],
        videos: mainVideoUrls,
        opcoesCor,
        opcoesTamanho: ["One Size"],
        publicado: true,
      },
      create: {
        nome: data.name,
        handle,
        descricao: data.description,
        preco: SINGLE_PRICE,
        precoOriginal: SINGLE_PRICE,
        collection: COLLECTION_NAME,
        fotos: mainImageUrls,
        fotoPrincipal: mainImageUrls[0],
        videos: mainVideoUrls,
        opcoesCor,
        opcoesTamanho: ["One Size"],
        tipo: "ROUPA",
        publicado: true,
      },
    });

    console.log(`Upserted product: ${data.name} (${handle}) with ${opcoesCor.length} colorway(s)`);
    importedCount++;
  }

  if (firstImageUrl) {
    await prisma.collection.update({
      where: { handle: COLLECTION_HANDLE },
      data: { image: firstImageUrl },
    });
  }

  console.log(`\nDone. ${importedCount} eyewear product(s) imported into "${COLLECTION_NAME}".`);
  console.log(`(Bundle pricing: single £${SINGLE_PRICE} / duo £${DUO_PRICE} / trio £${TRIO_PRICE})`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Fatal import error:", err);
  await prisma.$disconnect();
  process.exit(1);
});

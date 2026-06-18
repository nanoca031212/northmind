"use server";

import prisma from "@/lib/prisma";

export async function fetchProductPreview(id: string) {
  try {
    const product = await prisma.produto.findUnique({
      where: { id }
    });

    if (!product) return null;

    return {
      ...product,
      title: product.nome,
      description: product.descricao,
      price: product.preco,
      originalPrice: product.precoOriginal || product.preco,
      images: product.fotos,
      collection: product.collection
    };
  } catch (error) {
    console.error("Preview Server Action Error:", error);
    return null;
  }
}

export async function fetchAllProductsForPreview() {
  try {
    const products = await prisma.produto.findMany({
      where: { publicado: true }
    });
    return products.map(p => ({
      ...p,
      title: p.nome,
      price: p.preco,
      originalPrice: p.precoOriginal || p.preco,
      images: p.fotos,
      collection: p.collection
    }));
  } catch (error) {
    console.error("Fetch all preview error:", error);
    return [];
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  discount?: number;
}

interface CustomerInfo {
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  postcode?: string;
  country?: string;
  county?: string;
  complement?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, total, status, userEmail, customerInfo } = body as {
      items: OrderItem[];
      total: number;
      status: string;
      userEmail?: string;
      customerInfo: CustomerInfo;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items são obrigatórios." },
        { status: 400 },
      );
    }
    if (typeof total !== "number" || isNaN(total)) {
      return NextResponse.json({ error: "Total inválido." }, { status: 400 });
    }
    if (!customerInfo?.email) {
      return NextResponse.json(
        { error: "Email do cliente é obrigatório." },
        { status: 400 },
      );
    }

    // Usar o email da sessão (conta autenticada) ou o email de billing do form (guest)
    const lookupEmail = userEmail || customerInfo.email;

    let user = await prisma.user.findUnique({ where: { email: lookupEmail } });

    const fullName =
      `${customerInfo.firstName ?? ""} ${customerInfo.lastName ?? ""}`.trim() ||
      null;

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: lookupEmail,
          name: fullName,
        },
      });
    }

    const produtosIds = items.map((item) => item.id);

    const pedido = await prisma.pedido.create({
      data: {
        userId: user.id,
        status: status ?? "PAID",
        produtosIds,
        totalAmmount: total,
      },
    });

    return NextResponse.json({ id: pedido.id, userId: user.id });
  } catch (error: any) {
    console.error("Erro ao criar pedido:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao criar pedido." },
      { status: 500 },
    );
  }
}

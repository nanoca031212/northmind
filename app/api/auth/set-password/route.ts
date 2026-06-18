import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, orderId, password } = body;

    if (!userId || !orderId || !password) {
      return NextResponse.json(
        { error: "userId, orderId e password são obrigatórios." },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    // Verifica que o pedido pertence ao usuário
    const order = await prisma.pedido.findUnique({ where: { id: orderId } });

    if (!order || order.userId !== userId) {
      return NextResponse.json(
        { error: "Pedido não encontrado ou não pertence a este usuário." },
        { status: 403 }
      );
    }

    // Verifica que o usuário existe e ainda não tem senha
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    if (user.hashedPassword) {
      return NextResponse.json(
        { error: "Este usuário já possui uma senha definida." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { hashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao definir senha:", error);
    return NextResponse.json(
      { error: "Erro interno ao definir senha." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { email: string } }
) {
  const session = await getServerSession(authOptions);

  if ((session?.user as any)?.type !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: params.email } });

  return NextResponse.json(user);
}

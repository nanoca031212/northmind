import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/actions";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const result = await registerUser(data);
  return NextResponse.json(result);
}

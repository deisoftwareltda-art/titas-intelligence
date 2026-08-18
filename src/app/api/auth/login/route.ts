import { NextResponse } from "next/server";
import { validAccessKey } from "@/lib/server-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (body.email !== "admin@titas.volei" || !validAccessKey(body.password)) {
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
  }
  return NextResponse.json({ email: body.email, role: "ADMIN", accessKey: body.password });
}


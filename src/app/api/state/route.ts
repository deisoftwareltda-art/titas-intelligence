import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validAccessKey } from "@/lib/server-auth";

function authorized(request: Request) { return validAccessKey(request.headers.get("x-titas-key")); }
export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const state = await prisma.workspaceState.findUnique({ where: { id: "main" } });
  return NextResponse.json({ data: state?.data ?? null });
}
export async function PUT(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const data = await request.json();
  await prisma.workspaceState.upsert({ where: { id: "main" }, update: { data }, create: { id: "main", data } });
  return NextResponse.json({ ok: true });
}

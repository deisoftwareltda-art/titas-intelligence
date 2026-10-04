import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validAccessKey } from "@/lib/server-auth";

type StoredState = { data: Prisma.JsonValue; updatedAt: string };
function authorized(request: Request) { return validAccessKey(request.headers.get("x-titas-key")); }
function validState(data: unknown): data is Record<string, unknown> {
  if (!data || typeof data !== "object") return false;
  const state = data as Record<string, unknown>;
  return ["players", "opponents", "matches", "rallies"].every(key => Array.isArray(state[key]));
}
function restConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("SUPABASE_REST_NOT_CONFIGURED");
  return { url: url.replace(/\/$/, ""), headers: { apikey: key, authorization: "Bearer " + key, "content-type": "application/json" } };
}
async function restRows(query: string) {
  const { url, headers } = restConfig();
  const response = await fetch(url + "/rest/v1/WorkspaceState?" + query, { headers, cache: "no-store" });
  if (!response.ok) throw new Error("SUPABASE_REST_" + response.status + "_" + (await response.text()).slice(0, 160));
  return response.json();
}
async function readRest(): Promise<StoredState | null> {
  const rows = await restRows("id=eq.main&select=data,updatedAt");
  return rows[0] ?? null;
}
async function writeRest(data: Record<string, unknown>, expectedVersion: string | null) {
  const current = await readRest();
  if (expectedVersion && current && current.updatedAt !== expectedVersion) throw new Error("VERSION_CONFLICT");
  const { url, headers } = restConfig();
  if (current) {
    const backup = await fetch(url + "/rest/v1/WorkspaceState", { method: "POST", headers, body: JSON.stringify({ id: "backup-" + Date.now() + "-" + crypto.randomUUID(), data: current.data }) });
    if (!backup.ok) throw new Error("SUPABASE_BACKUP_" + backup.status);
  }
  const response = await fetch(url + "/rest/v1/WorkspaceState?on_conflict=id", { method: "POST", headers: { ...headers, prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify({ id: "main", data }) });
  if (!response.ok) throw new Error("SUPABASE_WRITE_" + response.status + "_" + (await response.text()).slice(0, 160));
  const rows = await response.json();
  return rows[0] as StoredState;
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const state = await readRest();
    return NextResponse.json({ data: state?.data ?? null, version: state?.updatedAt ?? null, source: "supabase-rest" });
  } catch (primaryError) {
    console.warn("workspace_state_rest_unavailable", primaryError instanceof Error ? primaryError.message : "unknown");
    try {
      const state = await prisma.workspaceState.findUnique({ where: { id: "main" } });
      return NextResponse.json({ data: state?.data ?? null, version: state?.updatedAt.toISOString() ?? null, source: "postgres" });
    } catch (fallbackError) {
      console.error("workspace_state_all_sources_failed", fallbackError instanceof Error ? fallbackError.message : "unknown");
      return NextResponse.json({ error: "Banco de dados indisponível. A última cópia local continuará ativa." }, { status: 503 });
    }
  }
}

export async function PUT(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const data = await request.json().catch(() => null);
  if (!validState(data)) return NextResponse.json({ error: "Estado inválido. Gravação recusada." }, { status: 400 });
  const expectedVersion = request.headers.get("x-titas-version");
  try {
    const updated = await writeRest(data, expectedVersion);
    return NextResponse.json({ ok: true, version: updated.updatedAt, source: "supabase-rest" });
  } catch (primaryError) {
    if (primaryError instanceof Error && primaryError.message === "VERSION_CONFLICT") return NextResponse.json({ error: "Os dados foram alterados em outro dispositivo. Sincronize antes de salvar." }, { status: 409 });
    console.warn("workspace_state_rest_write_unavailable", primaryError instanceof Error ? primaryError.message : "unknown");
    try {
      const updated = await prisma.$transaction(async tx => {
        const current = await tx.workspaceState.findUnique({ where: { id: "main" } });
        if (expectedVersion && current && current.updatedAt.toISOString() !== expectedVersion) throw new Error("VERSION_CONFLICT");
        if (current) await tx.workspaceState.create({ data: { id: "backup-" + Date.now() + "-" + crypto.randomUUID(), data: current.data as Prisma.InputJsonValue } });
        return tx.workspaceState.upsert({ where: { id: "main" }, update: { data: data as Prisma.InputJsonValue }, create: { id: "main", data: data as Prisma.InputJsonValue } });
      });
      return NextResponse.json({ ok: true, version: updated.updatedAt.toISOString(), source: "postgres" });
    } catch (fallbackError) {
      if (fallbackError instanceof Error && fallbackError.message === "VERSION_CONFLICT") return NextResponse.json({ error: "Os dados foram alterados em outro dispositivo. Sincronize antes de salvar." }, { status: 409 });
      console.error("workspace_state_all_writes_failed", fallbackError instanceof Error ? fallbackError.message : "unknown");
      return NextResponse.json({ error: "Banco indisponível. Os dados ficaram pendentes neste dispositivo." }, { status: 503 });
    }
  }
}
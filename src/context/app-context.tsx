"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { initialState } from "@/lib/demo-data";
import type { AppState } from "@/lib/types";

type AppContextValue = { state: AppState; update: (fn: (current: AppState) => AppState) => void; reset: () => void; syncing: boolean };
const AppContext = createContext<AppContextValue | null>(null);

function accessKey() {
  try { return JSON.parse(localStorage.getItem("titas-session") ?? "{}").accessKey ?? ""; }
  catch { return ""; }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRemote = useRef("");

  const loadRemote = useCallback(async () => {
    const key = accessKey();
    if (!key) return false;
    const response = await fetch("/api/state", { headers: { "x-titas-key": key }, cache: "no-store" });
    if (!response.ok) throw new Error("Falha ao carregar dados compartilhados.");
    const payload = await response.json();
    if (payload.data) {
      const serialized = JSON.stringify(payload.data);
      if (serialized !== lastRemote.current) {
        lastRemote.current = serialized;
        setState(payload.data);
        localStorage.setItem("titas-state", serialized);
      }
    }
    return true;
  }, []);

  useEffect(() => {
    loadRemote().catch(() => {}).finally(() => setReady(true));
  }, [loadRemote]);

  useEffect(() => {
    if (!ready || !accessKey()) return;
    const interval = setInterval(() => loadRemote().catch(() => {}), 5000);
    const refresh = () => { if (document.visibilityState === "visible") loadRemote().catch(() => {}); };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => { clearInterval(interval); document.removeEventListener("visibilitychange", refresh); window.removeEventListener("focus", refresh); };
  }, [ready, loadRemote]);

  useEffect(() => {
    if (!ready) return;
    const serialized = JSON.stringify(state);
    localStorage.setItem("titas-state", serialized);
    const key = accessKey();
    if (!key || serialized === lastRemote.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSyncing(true);
      try {
        const response = await fetch("/api/state", { method: "PUT", headers: { "content-type": "application/json", "x-titas-key": key }, body: serialized });
        if (!response.ok) throw new Error("Falha ao salvar dados compartilhados.");
        lastRemote.current = serialized;
      } finally { setSyncing(false); }
    }, 500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [state, ready]);

  const update = (fn: (current: AppState) => AppState) => setState(current => fn(current));
  return <AppContext.Provider value={{ state, update, reset: () => setState(initialState), syncing }}>{children}</AppContext.Provider>;
}

export function useApp() { const value = useContext(AppContext); if (!value) throw new Error("useApp deve ser usado dentro de AppProvider"); return value; }

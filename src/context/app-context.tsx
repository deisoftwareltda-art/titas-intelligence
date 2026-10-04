"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { AppState } from "@/lib/types";

const emptyState: AppState = { players: [], opponents: [], matches: [], rallies: [] };
type SyncStatus = "loading" | "saved" | "saving" | "offline" | "local";
type AppContextValue = { state: AppState; update: (fn: (current: AppState) => AppState) => void; reset: () => void; syncing: boolean; syncStatus: SyncStatus; retrySync: () => void };
const AppContext = createContext<AppContextValue | null>(null);
function accessKey() { try { return JSON.parse(localStorage.getItem("titas-session") ?? "{}").accessKey ?? ""; } catch { return ""; } }
function validState(value: unknown): value is AppState { if (!value || typeof value !== "object") return false; const s=value as Record<string,unknown>; return ["players","opponents","matches","rallies"].every(k=>Array.isArray(s[k])); }
function readLocal(key: string) { try { const value=JSON.parse(localStorage.getItem(key)??"null"); return validState(value)?value:null; } catch { return null; } }

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state,setState]=useState<AppState>(emptyState); const [ready,setReady]=useState(false); const [syncStatus,setSyncStatus]=useState<SyncStatus>("loading"); const [syncMessage,setSyncMessage]=useState("");
  const saveTimer=useRef<ReturnType<typeof setTimeout>|null>(null); const lastRemote=useRef(""); const remoteVersion=useRef<string|null>(null); const remoteAvailable=useRef(false);
  const loadRemote=useCallback(async()=>{
    const key=accessKey(); if(!key){remoteAvailable.current=false;setState(readLocal("titas-pending-state")??readLocal("titas-state")??emptyState);setSyncStatus("local");return false}
    const response=await fetch("/api/state",{headers:{"x-titas-key":key},cache:"no-store"});const payload=await response.json().catch(()=>({}));
    if(!response.ok){remoteAvailable.current=false;setState(readLocal("titas-pending-state")??readLocal("titas-state")??emptyState);throw new Error(payload.error??"Falha ao carregar o banco.")}
    const remote=validState(payload.data)?payload.data:emptyState;lastRemote.current=JSON.stringify(remote);remoteVersion.current=payload.version??null;remoteAvailable.current=true;
    const pending=readLocal("titas-pending-state");setState(pending??remote);if(!pending)localStorage.setItem("titas-state",JSON.stringify(remote));setSyncMessage("");setSyncStatus(pending?"saving":"saved");return true;
  },[]);
  useEffect(()=>{loadRemote().catch(e=>{setSyncMessage(e.message);setSyncStatus("offline")}).finally(()=>setReady(true))},[loadRemote]);
  useEffect(()=>{if(!ready||!accessKey())return;const interval=setInterval(()=>loadRemote().catch(e=>{setSyncMessage(e.message);setSyncStatus("offline")}),60000);const refresh=()=>{if(document.visibilityState==="visible")loadRemote().catch(e=>{setSyncMessage(e.message);setSyncStatus("offline")})};document.addEventListener("visibilitychange",refresh);window.addEventListener("focus",refresh);return()=>{clearInterval(interval);document.removeEventListener("visibilitychange",refresh);window.removeEventListener("focus",refresh)}},[ready,loadRemote]);
  useEffect(()=>{
    if(!ready)return;const serialized=JSON.stringify(state);localStorage.setItem("titas-state",serialized);const key=accessKey();if(!key)return;
    if(!remoteAvailable.current){if(localStorage.getItem("titas-pending-state"))setSyncStatus("offline");return}
    if(serialized===lastRemote.current){localStorage.removeItem("titas-pending-state");return}
    localStorage.setItem("titas-pending-state",serialized);if(saveTimer.current)clearTimeout(saveTimer.current);saveTimer.current=setTimeout(async()=>{setSyncStatus("saving");try{const headers:Record<string,string>={"content-type":"application/json","x-titas-key":key};if(remoteVersion.current)headers["x-titas-version"]=remoteVersion.current;const response=await fetch("/api/state",{method:"PUT",headers,body:serialized});const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.error??"Falha ao salvar.");lastRemote.current=serialized;remoteVersion.current=payload.version??null;localStorage.removeItem("titas-pending-state");setSyncMessage("");setSyncStatus("saved")}catch(e){remoteAvailable.current=false;setSyncMessage(e instanceof Error?e.message:"Falha ao salvar.");setSyncStatus("offline")}},500);return()=>{if(saveTimer.current)clearTimeout(saveTimer.current)}
  },[state,ready]);
  const update=(fn:(current:AppState)=>AppState)=>setState(current=>{const next=fn(current);if(!remoteAvailable.current&&accessKey())localStorage.setItem("titas-pending-state",JSON.stringify(next));return next});
  const retrySync=()=>loadRemote().catch(e=>{setSyncMessage(e.message);setSyncStatus("offline")});const syncing=syncStatus==="loading"||syncStatus==="saving";
  return <AppContext.Provider value={{state,update,reset:()=>update(()=>emptyState),syncing,syncStatus,retrySync}}>{children}
    {accessKey()&&syncStatus==="offline"&&<div className="fixed bottom-4 left-4 right-4 z-[100] mx-auto flex max-w-2xl items-center gap-3 rounded-xl border border-amber-500/50 bg-[#251e10] p-4 text-sm shadow-2xl"><div><b className="block text-amber-300">Modo offline — alterações guardadas neste dispositivo</b><span className="text-[#d8ccb3]">{syncMessage||"A sincronização será retomada automaticamente."}</span></div><button onClick={retrySync} className="ml-auto shrink-0 rounded-lg bg-amber-500 px-3 py-2 font-bold text-black">Sincronizar</button></div>}
    {accessKey()&&syncStatus==="saving"&&<div className="fixed bottom-4 right-4 z-[100] rounded-lg bg-[#202321] px-3 py-2 text-xs text-[#e8b923] shadow-xl">Sincronizando…</div>}
  </AppContext.Provider>
}
export function useApp(){const value=useContext(AppContext);if(!value)throw new Error("useApp deve ser usado dentro de AppProvider");return value}
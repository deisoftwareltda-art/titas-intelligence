"use client";

import { Shell } from "@/components/shell";
import { useApp } from "@/context/app-context";
import type { Match } from "@/lib/types";
import { BarChart3, Calendar, MapPin, Pencil, Plus, Radio, Trash2, X } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function MatchesPage() {
  const { state, update } = useApp();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Match | null>(null);
  const [message, setMessage] = useState("");
  const close = () => { setOpen(false); setEditing(null); };
  const beginCreate = () => { setEditing(null); setOpen(true); setMessage(""); };
  const beginEdit = (match: Match) => { setEditing(match); setOpen(true); setMessage(""); };
  const remove = (match: Match) => {
    const opponent = state.opponents.find(o => o.id === match.opponentId)?.name ?? "adversário";
    const rallyCount = state.rallies.filter(r => r.matchId === match.id).length;
    const warning = rallyCount > 0 ? ` Também serão excluídos ${rallyCount} ralis e suas estatísticas.` : "";
    if (!window.confirm(`Excluir a partida Titãs x ${opponent}?${warning} Esta ação não poderá ser desfeita.`)) return;
    update(s => ({ ...s, matches: s.matches.filter(m => m.id !== match.id), rallies: s.rallies.filter(r => r.matchId !== match.id) }));
    setMessage("Partida excluída com sucesso.");
  };
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const d = new FormData(e.currentTarget);
    const m: Match = editing
      ? { ...editing, competition: String(d.get("competition")), phase: String(d.get("phase")), date: String(d.get("date")), time: String(d.get("time")), venue: String(d.get("venue")), opponentId: String(d.get("opponentId")), home: d.get("home") === "true" }
      : { id: crypto.randomUUID(), competition: String(d.get("competition")), phase: String(d.get("phase")), date: String(d.get("date")), time: String(d.get("time")), venue: String(d.get("venue")), opponentId: String(d.get("opponentId")), home: d.get("home") === "true", status: "AGENDADA", titasSets: 0, opponentSets: 0, lineup: state.players.slice(0, 6).map(p => p.id) };
    update(s => ({ ...s, matches: editing ? s.matches.map(match => match.id === editing.id ? m : match) : [...s.matches, m] }));
    close(); setMessage(editing ? "Partida alterada com sucesso." : "Partida criada com sucesso.");
  };
  return <Shell title="Partidas">
    {message && <div className="mb-4 flex items-center rounded-xl border border-[#e8b923]/30 bg-[#e8b923]/10 px-4 py-3 text-sm"><span>{message}</span><button className="ml-auto" onClick={() => setMessage("")}><X size={16}/></button></div>}
    <div className="mb-6 flex items-center justify-between"><p className="text-sm text-[#a3a39f]">Agenda, escalação e entrada no scout.</p><button onClick={beginCreate} className="btn-primary flex gap-2"><Plus size={18}/> Nova partida</button></div>
    <div className="space-y-4">{state.matches.map(m => { const o = state.opponents.find(o => o.id === m.opponentId); return <div className="panel flex flex-col gap-5 p-6 lg:flex-row lg:items-center" key={m.id}>
      <div className="flex h-16 w-16 flex-col items-center justify-center rounded-xl bg-[#202321]"><b className="text-xl">{new Date(m.date + "T12:00").getDate()}</b><small className="uppercase text-[#e8b923]">{new Date(m.date + "T12:00").toLocaleString("pt-BR", { month: "short" })}</small></div>
      <div className="flex-1"><div className="label">{m.competition} · {m.phase}</div><h2 className="text-xl font-black">Titãs Vôlei <span className="text-[#777]">x</span> {o?.name}</h2><div className="mt-2 flex flex-wrap gap-4 text-xs text-[#a3a39f]"><span className="flex gap-1"><Calendar size={14}/>{m.time}</span><span className="flex gap-1"><MapPin size={14}/>{m.venue}</span></div></div>
      <div className="flex flex-col gap-2 sm:flex-row"><button onClick={() => beginEdit(m)} className="btn-secondary flex items-center justify-center gap-2"><Pencil size={17}/> Editar</button><button onClick={() => remove(m)} className="flex items-center justify-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 font-bold text-red-400 hover:bg-red-500/10"><Trash2 size={17}/> Excluir</button><Link href={`/partidas/${m.id}`} className="btn-secondary flex justify-center gap-2"><BarChart3 size={18}/> Ver estatísticas</Link><Link href={`/scout?match=${m.id}`} className="btn-primary flex justify-center gap-2"><Radio size={18}/> Abrir scout</Link></div>
    </div>})}</div>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><form onSubmit={submit} className="panel w-full max-w-2xl p-6"><div className="mb-5 flex"><div><div className="label text-[#e8b923]">{editing ? "Alteração" : "Cadastro"}</div><h2 className="text-xl font-black">{editing ? "Editar partida" : "Nova partida"}</h2></div><button type="button" onClick={close} className="ml-auto"><X/></button></div><div className="grid gap-4 sm:grid-cols-2">
      <label><span className="label">Competição</span><input required name="competition" defaultValue={editing?.competition} className="input mt-1"/></label><label><span className="label">Fase</span><input name="phase" defaultValue={editing?.phase} className="input mt-1"/></label><label><span className="label">Data</span><input required name="date" defaultValue={editing?.date} type="date" className="input mt-1"/></label><label><span className="label">Horário</span><input required name="time" defaultValue={editing?.time} type="time" className="input mt-1"/></label><label><span className="label">Adversário</span><select required name="opponentId" defaultValue={editing?.opponentId} className="input mt-1">{state.opponents.map(o => <option value={o.id} key={o.id}>{o.name}</option>)}</select></label><label><span className="label">Local da partida</span><input name="venue" defaultValue={editing?.venue} className="input mt-1"/></label><label><span className="label">Mando</span><select name="home" defaultValue={editing?.home === false ? "false" : "true"} className="input mt-1"><option value="true">Mandante</option><option value="false">Visitante</option></select></label>
    </div><button className="btn-primary mt-6 w-full">{editing ? "Salvar alterações" : "Criar partida e preparar escalação"}</button></form></div>}
  </Shell>;
}

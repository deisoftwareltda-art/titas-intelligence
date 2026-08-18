"use client";

import { Shell } from "@/components/shell";
import { useApp } from "@/context/app-context";
import type { Opponent } from "@/lib/types";
import { MapPin, Pencil, Plus, Search, Shield, Trash2, X } from "lucide-react";
import { FormEvent, useState } from "react";

export default function OpponentsPage() {
  const { state, update } = useApp();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Opponent | null>(null);
  const [message, setMessage] = useState("");
  const list = state.opponents.filter(o => `${o.name} ${o.city}`.toLowerCase().includes(query.toLowerCase()));

  const close = () => { setOpen(false); setEditing(null); };
  const beginCreate = () => { setEditing(null); setOpen(true); setMessage(""); };
  const beginEdit = (opponent: Opponent) => { setEditing(opponent); setOpen(true); setMessage(""); };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const opponent: Opponent = {
      id: editing?.id ?? crypto.randomUUID(),
      name: String(d.get("name")),
      city: String(d.get("city")),
      state: String(d.get("state")).toUpperCase(),
      competition: String(d.get("competition")),
      coach: String(d.get("coach")),
      notes: String(d.get("notes")),
    };
    update(s => ({
      ...s,
      opponents: editing
        ? s.opponents.map(o => o.id === editing.id ? opponent : o)
        : [...s.opponents, opponent],
    }));
    close();
    setMessage(editing ? "Adversário alterado com sucesso." : "Adversário cadastrado com sucesso.");
  };

  const remove = (opponent: Opponent) => {
    const linkedMatches = state.matches.filter(m => m.opponentId === opponent.id).length;
    if (linkedMatches > 0) {
      setMessage(`Este adversário está vinculado a ${linkedMatches} partida(s) e não pode ser excluído. Você ainda pode editar seus dados.`);
      return;
    }
    if (!window.confirm(`Excluir o adversário ${opponent.name}? Esta ação não poderá ser desfeita.`)) return;
    update(s => ({ ...s, opponents: s.opponents.filter(o => o.id !== opponent.id) }));
    setMessage("Adversário excluído com sucesso.");
  };

  return <Shell title="Adversários">
    {message && <div className="mb-4 flex items-center rounded-xl border border-[#e8b923]/30 bg-[#e8b923]/10 px-4 py-3 text-sm"><span>{message}</span><button className="ml-auto" onClick={() => setMessage("")}><X size={16}/></button></div>}
    <div className="mb-6 flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1"><Search className="absolute left-3 top-3 text-[#777]" size={18}/><input className="input pl-10" placeholder="Buscar adversário..." value={query} onChange={e => setQuery(e.target.value)}/></div>
      <button onClick={beginCreate} className="btn-primary flex items-center justify-center gap-2"><Plus size={18}/> Novo adversário</button>
    </div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{list.map(o => <div key={o.id} className="panel p-6">
      <Shield className="mb-5 text-[#e8b923]"/><h2 className="text-xl font-black">{o.name}</h2><div className="mt-1 flex items-center gap-1 text-sm text-[#a3a39f]"><MapPin size={14}/>{o.city} · {o.state}</div>
      <div className="mt-5 border-t border-[#30332f] pt-4"><div className="label">Competição</div><b>{o.competition || "Não informada"}</b><div className="label mt-3">Técnico</div><b>{o.coach || "Não informado"}</b>{o.notes && <><div className="label mt-3">Observações</div><p className="text-sm text-[#a3a39f]">{o.notes}</p></>}</div>
      <div className="mt-5 grid grid-cols-2 gap-2"><button onClick={() => beginEdit(o)} className="btn-secondary flex items-center justify-center gap-2"><Pencil size={16}/> Editar</button><button onClick={() => remove(o)} className="flex items-center justify-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 font-bold text-red-400 hover:bg-red-500/10"><Trash2 size={16}/> Excluir</button></div>
    </div>)}</div>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><form onSubmit={submit} className="panel w-full max-w-xl p-6"><div className="mb-6 flex"><div><div className="label text-[#e8b923]">{editing ? "Alteração" : "Cadastro"}</div><h2 className="text-xl font-black">{editing ? "Editar adversário" : "Novo adversário"}</h2></div><button type="button" className="ml-auto" onClick={close}><X/></button></div><div className="grid gap-4 sm:grid-cols-2">
      <label><span className="label">Equipe</span><input required name="name" defaultValue={editing?.name} className="input mt-1"/></label>
      <label><span className="label">Cidade</span><input required name="city" defaultValue={editing?.city} className="input mt-1"/></label>
      <label><span className="label">Estado</span><input required name="state" defaultValue={editing?.state} maxLength={2} className="input mt-1"/></label>
      <label><span className="label">Competição</span><input name="competition" defaultValue={editing?.competition} className="input mt-1"/></label>
      <label className="sm:col-span-2"><span className="label">Técnico</span><input name="coach" defaultValue={editing?.coach} className="input mt-1"/></label>
      <label className="sm:col-span-2"><span className="label">Observações</span><textarea name="notes" defaultValue={editing?.notes} className="input mt-1 min-h-24"/></label>
    </div><button className="btn-primary mt-6 w-full">{editing ? "Salvar alterações" : "Salvar adversário"}</button></form></div>}
  </Shell>;
}

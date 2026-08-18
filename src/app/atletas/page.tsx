"use client";

import { Shell } from "@/components/shell";
import { useApp } from "@/context/app-context";
import type { Player, Position } from "@/lib/types";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { FormEvent, useState } from "react";

const positions: Position[] = ["Levantador", "Oposto", "Ponteiro", "Central", "Líbero"];

export default function PlayersPage() {
  const { state, update } = useApp();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [message, setMessage] = useState("");
  const list = state.players.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  const close = () => { setOpen(false); setEditing(null); };
  const beginCreate = () => { setEditing(null); setOpen(true); setMessage(""); };
  const beginEdit = (player: Player) => { setEditing(player); setOpen(true); setMessage(""); };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const player: Player = {
      id: editing?.id ?? crypto.randomUUID(),
      name: String(d.get("name")),
      number: Number(d.get("number")),
      position: d.get("position") as Position,
      height: Number(d.get("height")) || undefined,
      attackReach: Number(d.get("attackReach")) || undefined,
      blockReach: Number(d.get("blockReach")) || undefined,
      dominantHand: d.get("hand") as "Direita" | "Esquerda",
      active: d.get("active") === "true",
    };
    update(s => ({
      ...s,
      players: editing ? s.players.map(p => p.id === editing.id ? player : p) : [...s.players, player],
    }));
    close();
    setMessage(editing ? "Atleta alterado com sucesso." : "Atleta cadastrado com sucesso.");
  };

  const remove = (player: Player) => {
    const hasHistory = state.rallies.some(r => r.actions.some(a => a.playerId === player.id));
    if (hasHistory) {
      setMessage("Este atleta possui histórico de jogo e não pode ser excluído. Marque-o como inativo.");
      return;
    }
    if (!window.confirm(`Excluir o atleta ${player.name}? Esta ação não poderá ser desfeita.`)) return;
    update(s => ({
      ...s,
      players: s.players.filter(p => p.id !== player.id),
      matches: s.matches.map(m => ({ ...m, lineup: m.lineup.filter(id => id !== player.id) })),
    }));
    setMessage("Atleta excluído com sucesso.");
  };

  return <Shell title="Atletas">
    {message && <div className="mb-4 flex items-center rounded-xl border border-[#e8b923]/30 bg-[#e8b923]/10 px-4 py-3 text-sm"><span>{message}</span><button className="ml-auto" onClick={() => setMessage("")}><X size={16}/></button></div>}
    <div className="mb-6 flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1"><Search className="absolute left-3 top-3 text-[#777]" size={18}/><input className="input pl-10" placeholder="Buscar atleta..." value={query} onChange={e => setQuery(e.target.value)}/></div>
      <button className="btn-primary flex items-center justify-center gap-2" onClick={beginCreate}><Plus size={18}/> Novo atleta</button>
    </div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{list.map(p => <div className="panel p-5" key={p.id}>
      <div className="flex items-start"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8b923] text-xl font-black text-black">{p.number}</div><div className="ml-4"><div className="text-lg font-black">{p.name}</div><div className="text-sm text-[#e8b923]">{p.position}</div></div><span className={`ml-auto rounded-full px-2 py-1 text-xs font-bold ${p.active ? "bg-emerald-400/10 text-emerald-400" : "bg-[#777]/10 text-[#999]"}`}>{p.active ? "ATIVO" : "INATIVO"}</span></div>
      <div className="mt-5 grid grid-cols-3 border-t border-[#30332f] pt-4 text-center"><div><div className="label">Altura</div><b>{p.height || "—"}<small> cm</small></b></div><div><div className="label">Ataque</div><b>{p.attackReach || "—"}<small> cm</small></b></div><div><div className="label">Bloqueio</div><b>{p.blockReach || "—"}<small> cm</small></b></div></div>
      <div className="mt-5 grid grid-cols-2 gap-2"><button onClick={() => beginEdit(p)} className="btn-secondary flex items-center justify-center gap-2"><Pencil size={16}/> Editar</button><button onClick={() => remove(p)} className="flex items-center justify-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 font-bold text-red-400 hover:bg-red-500/10"><Trash2 size={16}/> Excluir</button></div>
    </div>)}</div>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><form onSubmit={submit} className="panel w-full max-w-xl p-6"><div className="mb-6 flex"><div><div className="label text-[#e8b923]">{editing ? "Alteração" : "Cadastro"}</div><h2 className="text-xl font-black">{editing ? "Editar atleta" : "Novo atleta"}</h2></div><button type="button" className="ml-auto" onClick={close}><X/></button></div><div className="grid gap-4 sm:grid-cols-2">
      <label><span className="label">Nome</span><input required name="name" defaultValue={editing?.name} className="input mt-1"/></label>
      <label><span className="label">Camisa</span><input required name="number" defaultValue={editing?.number} type="number" min="1" max="99" className="input mt-1"/></label>
      <label><span className="label">Posição</span><select name="position" defaultValue={editing?.position} className="input mt-1">{positions.map(x => <option key={x}>{x}</option>)}</select></label>
      <label><span className="label">Mão dominante</span><select name="hand" defaultValue={editing?.dominantHand ?? "Direita"} className="input mt-1"><option>Direita</option><option>Esquerda</option></select></label>
      <label><span className="label">Altura (cm)</span><input name="height" defaultValue={editing?.height} type="number" className="input mt-1"/></label>
      <label><span className="label">Alcance ataque</span><input name="attackReach" defaultValue={editing?.attackReach} type="number" className="input mt-1"/></label>
      <label><span className="label">Alcance bloqueio</span><input name="blockReach" defaultValue={editing?.blockReach} type="number" className="input mt-1"/></label>
      <label><span className="label">Status</span><select name="active" defaultValue={editing?.active === false ? "false" : "true"} className="input mt-1"><option value="true">Ativo</option><option value="false">Inativo</option></select></label>
    </div><button className="btn-primary mt-6 w-full">{editing ? "Salvar alterações" : "Salvar atleta"}</button></form></div>}
  </Shell>;
}

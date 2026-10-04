import type { AppState, Match } from "@/lib/types";
import { playerStatistics } from "@/lib/statistics";

const statusColor = {
  success: "text-emerald-400",
  error: "text-red-400",
  neutral: "text-[#a3a39f]",
};

export function PlayerScout({ state, match }: { state: AppState; match: Match }) {
  const stats = playerStatistics(state, match.id);
  return <div className="panel mt-7 p-6">
    <div className="label text-[#e8b923]">Scout individual</div>
    <h2 className="text-lg font-black">Passe, saque, ataque e bloqueio por jogador</h2>
    <p className="mt-1 text-sm text-[#a3a39f]">Abra o atleta para consultar acertos, erros, ações neutras e cada resultado registrado.</p>
    <div className="mt-5 space-y-3">{stats.map(item => <details key={item.player.id} className="rounded-xl border border-[#30332f] bg-[#111311] p-4">
      <summary className="cursor-pointer list-none">
        <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4">
          <div><b className="text-[#e8b923]">#{item.player.number}</b> <b>{item.player.name}</b><div className="text-xs text-[#a3a39f]">{item.player.position} · {item.actions} ações avaliadas</div></div>
          <div className="text-center"><div className="text-lg font-black text-emerald-400">{item.successes}</div><div className="text-[10px] uppercase text-[#a3a39f]">Acertos</div></div>
          <div className="text-center"><div className="text-lg font-black text-red-400">{item.errors}</div><div className="text-[10px] uppercase text-[#a3a39f]">Erros</div></div>
          <div className="text-center"><div className="text-lg font-black">{item.efficiency}%</div><div className="text-[10px] uppercase text-[#a3a39f]">Acerto</div></div>
        </div>
      </summary>
      <div className="mt-4 grid gap-3 border-t border-[#30332f] pt-4 sm:grid-cols-2 xl:grid-cols-4">
        {item.fundamentals.map(fundamental => <div key={fundamental.skill} className="rounded-xl bg-[#202321] p-4">
          <div className="flex items-start justify-between"><div><b>{fundamental.label}</b><div className="text-[10px] uppercase text-[#777]">{fundamental.attempts} tentativas</div></div><span className="rounded-lg bg-[#111311] px-2 py-1 text-sm font-black">{fundamental.efficiency}%</span></div>
          <div className="my-3 grid grid-cols-3 gap-1 text-center">
            <div className="rounded bg-emerald-500/10 p-2"><b className="block text-emerald-400">{fundamental.successes}</b><span className="text-[9px] uppercase text-[#a3a39f]">Acertos</span></div>
            <div className="rounded bg-red-500/10 p-2"><b className="block text-red-400">{fundamental.errors}</b><span className="text-[9px] uppercase text-[#a3a39f]">Erros</span></div>
            <div className="rounded bg-white/5 p-2"><b className="block text-[#a3a39f]">{fundamental.neutral}</b><span className="text-[9px] uppercase text-[#a3a39f]">Neutras</span></div>
          </div>
          <div className="space-y-1 border-t border-[#30332f] pt-2">{fundamental.results.length ? fundamental.results.map(result => <div key={result.result} className="flex justify-between text-xs"><span className={statusColor[result.status]}>{result.result}</span><b>{result.count}</b></div>) : <div className="text-xs text-[#777]">Sem ações registradas.</div>}</div>
        </div>)}
      </div>
    </details>)}</div>
  </div>;
}
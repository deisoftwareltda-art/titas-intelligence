"use client";

import { Shell } from "@/components/shell";
import { StatCard } from "@/components/ui";
import { PlayerScout } from "@/components/player-scout";
import { useApp } from "@/context/app-context";
import { matchStatistics, playerStatistics } from "@/lib/statistics";
import { ArrowLeft, Download, Radio } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function MatchStatisticsPage() {
  const { state } = useApp(); const { id } = useParams<{ id: string }>();
  const match = state.matches.find(m => m.id === id);
  if (!match) return <Shell title="Estatísticas da partida"><div className="panel p-10 text-center">Partida não encontrada.</div></Shell>;
  const opponent = state.opponents.find(o => o.id === match.opponentId); const s = matchStatistics(state, match.id);
  const playerStats = playerStatistics(state, match.id);
  const setter = state.players.find(p => match.lineup.includes(p.id) && p.position === "Levantador");
  const bestEfficiency = Math.max(...s.rotations.filter(r => r.rallies > 0).map(r => r.efficiency), -1);
  const generatePdf = async () => {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF();
    const opponentName = opponent?.name ?? "Adversário";
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(19); pdf.text("TITAS INTELLIGENCE", 15, 18);
    pdf.setFontSize(11); pdf.setTextColor(90); pdf.text("Performance & Scouting — Relatório técnico", 15, 25);
    pdf.setTextColor(20); pdf.setFontSize(15); pdf.text(`Titãs Vôlei ${s.pointsFor} x ${s.pointsAgainst} ${opponentName}`, 15, 39);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.text(`${match.competition} · ${new Date(match.date + "T12:00").toLocaleDateString("pt-BR")} · ${match.venue}`, 15, 46);
    const indicators = [
      ["Ralis", s.rallies], ["Eficiência de ataque", `${s.attackEfficiency}%`], ["Recepção positiva", `${s.receptionPositive}%`],
      ["Side-out", `${s.sideOut}%`], ["Break point", `${s.breakPoint}%`], ["Aces", s.aces], ["Erros de saque", s.serveErrors], ["Bloqueios", s.blocks],
    ];
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(13); pdf.text("Indicadores da partida", 15, 60);
    pdf.setFontSize(10); indicators.forEach(([label, value], i) => { const col = i % 2, row = Math.floor(i / 2); const x = 15 + col * 92, y = 70 + row * 10; pdf.setFont("helvetica", "normal"); pdf.text(String(label), x, y); pdf.setFont("helvetica", "bold"); pdf.text(String(value), x + 62, y); });
    pdf.setFontSize(13); pdf.text("Desempenho por rotação", 15, 116);
    const headers = ["Rot.", "Ralis", "Ganhos", "Perdidos", "Eficiência", "Side-out", "Break point", "Ataque", "Erros"];
    const widths = [13, 16, 18, 18, 22, 20, 24, 19, 14]; let x = 15;
    pdf.setFillColor(20, 28, 37); pdf.rect(15, 122, 176, 9, "F"); pdf.setTextColor(255); pdf.setFontSize(8); headers.forEach((h, i) => { pdf.text(h, x + 1, 128); x += widths[i]; });
    pdf.setTextColor(20); s.rotations.forEach((r, row) => { let cx = 15; const y = 138 + row * 9; const values = [`P${r.rotation}`, r.rallies, r.won, r.lost, `${r.efficiency}%`, `${r.sideOut}%`, `${r.breakPoint}%`, `${r.attackEfficiency}%`, r.errors]; values.forEach((v, i) => { pdf.text(String(v), cx + 1, y); cx += widths[i]; }); pdf.setDrawColor(220); pdf.line(15, y + 2, 191, y + 2); });
    pdf.setTextColor(100); pdf.setFontSize(8); pdf.text("Estatísticas calculadas exclusivamente a partir dos ralis registrados no Titãs Intelligence.", 15, 202);
    playerStats.forEach(({ player, actions, successes, errors, fundamentals }) => {
      pdf.addPage();
      pdf.setTextColor(20); pdf.setFont("helvetica", "bold"); pdf.setFontSize(16);
      pdf.text(`#${player.number} ${player.name}`, 15, 20);
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(10);
      pdf.text(`${actions} ações registradas  |  ${successes} acertos  |  ${errors} erros`, 15, 28);
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(12);
      pdf.text("Acertos e erros por fundamento", 15, 42);

      let y = 52;
      fundamentals.filter(f => f.attempts > 0).forEach(fundamental => {
        if (y > 260) { pdf.addPage(); y = 20; }
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(11);
        pdf.text(fundamental.label, 15, y);
        pdf.setFont("helvetica", "normal"); pdf.setFontSize(9);
        pdf.text(`${fundamental.attempts} ações  |  ${fundamental.successes} acertos  |  ${fundamental.errors} erros`, 15, y + 6);
        const successfulResults = fundamental.results.filter(r => r.status === "success").map(r => `${r.result} (${r.count})`);
        const errorResults = fundamental.results.filter(r => r.status === "error").map(r => `${r.result} (${r.count})`);
        const neutralResults = fundamental.results.filter(r => r.status === "neutral").map(r => `${r.result} (${r.count})`);
        const lines = [
          `Acertos: ${successfulResults.join(", ") || "nenhum"}`,
          `Erros: ${errorResults.join(", ") || "nenhum"}`,
          ...(neutralResults.length ? [`Outros resultados: ${neutralResults.join(", ")}`] : []),
        ];
        y += 12;
        lines.forEach(line => {
          const wrapped = pdf.splitTextToSize(line, 175) as string[];
          if (y + wrapped.length * 5 > 280) { pdf.addPage(); y = 20; }
          pdf.text(wrapped, 18, y);
          y += wrapped.length * 5;
        });
        y += 7;
      });
      if (!fundamentals.some(f => f.attempts > 0)) {
        pdf.setFont("helvetica", "normal"); pdf.setFontSize(10);
        pdf.text("Nenhuma ação individual foi registrada para este atleta.", 15, y);
      }
    });
    pdf.save(`titas-${opponentName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${match.date}.pdf`);
  };
  return <Shell title="Estatísticas da partida" eyebrow={`${match.competition} · ${match.phase}`}>
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center"><Link href="/partidas" className="btn-secondary flex items-center justify-center gap-2"><ArrowLeft size={17}/> Voltar</Link><div className="flex flex-col gap-2 sm:ml-auto sm:flex-row"><button onClick={generatePdf} className="btn-secondary flex items-center justify-center gap-2"><Download size={17}/> Baixar PDF</button><Link href={`/scout?match=${match.id}`} className="btn-primary flex items-center justify-center gap-2"><Radio size={17}/> Abrir scout</Link></div></div>
    <div className="panel mb-6 p-6 text-center"><div className="label mb-2">{new Date(match.date + "T12:00").toLocaleDateString("pt-BR")} · {match.venue}</div><h2 className="text-2xl font-black">Titãs Vôlei <span className="mx-3 text-[#e8b923]">{s.pointsFor} × {s.pointsAgainst}</span> {opponent?.name}</h2><div className="mt-2 text-sm text-[#a3a39f]">{s.rallies} ralis registrados · Sets {match.titasSets} × {match.opponentSets}</div></div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Eficiência ataque" value={s.attackEfficiency} suffix="%"/><StatCard label="Recepção positiva" value={s.receptionPositive} suffix="%"/><StatCard label="Side-out" value={s.sideOut} suffix="%"/><StatCard label="Break point" value={s.breakPoint} suffix="%"/><StatCard label="Aces" value={s.aces}/><StatCard label="Erros de saque" value={s.serveErrors}/><StatCard label="Bloqueios" value={s.blocks}/><StatCard label="Recepção perfeita" value={s.perfectReception} suffix="%"/></div>
    <div className="panel mt-7 overflow-hidden"><div className="p-6"><div className="label text-[#e8b923]">P1 a P6 · posição do levantador</div><h2 className="text-lg font-black">Desempenho das rotações nesta partida</h2><p className="mt-1 text-sm text-[#a3a39f]">{setter ? "Levantador: #" + setter.number + " " + setter.name + ". P1 a P6 indicam onde ele estava em quadra." : "Defina um levantador na formação para identificá-lo nas rotações."}</p></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-[#111311] text-left text-[#a3a39f]"><tr>{["Rotação","Ralis","Ganhos","Perdidos","Eficiência","Side-out","Break point","Ef. ataque","Erros"].map(h => <th className="px-5 py-3" key={h}>{h}</th>)}</tr></thead><tbody>{s.rotations.map(r => <tr className={`border-t ${r.rallies > 0 && r.efficiency === bestEfficiency ? "border-emerald-500/50 bg-emerald-500/10" : "border-[#30332f]"}`} key={r.rotation}><td className={`px-5 py-4 font-black ${r.rallies > 0 && r.efficiency === bestEfficiency ? "text-emerald-400" : "text-[#e8b923]"}`}>P{r.rotation}{r.rallies > 0 && r.efficiency === bestEfficiency && <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-1 text-[10px] uppercase">Melhor</span>}</td><td className="px-5">{r.rallies}</td><td className="px-5 text-emerald-400">{r.won}</td><td className="px-5 text-red-400">{r.lost}</td><td className="px-5 font-bold">{r.efficiency}%</td><td className="px-5">{r.sideOut}%</td><td className="px-5">{r.breakPoint}%</td><td className="px-5">{r.attackEfficiency}%</td><td className="px-5">{r.errors}</td></tr>)}</tbody></table></div></div>
    <PlayerScout state={state} match={match}/>
    <div className="mt-7 grid gap-4 md:grid-cols-3"><div className="panel p-5"><div className="label">Ataque</div><div className="mt-2 text-2xl font-black">{s.attackPoints}/{s.attackAttempts}</div><p className="text-sm text-[#a3a39f]">pontos/tentativas · {s.attackErrors} erros</p></div><div className="panel p-5"><div className="label">Saque</div><div className="mt-2 text-2xl font-black">{s.aces} aces</div><p className="text-sm text-[#a3a39f]">{s.serveAttempts} tentativas · {s.serveErrors} erros</p></div><div className="panel p-5"><div className="label">Recepção</div><div className="mt-2 text-2xl font-black">{s.receptionPositive}%</div><p className="text-sm text-[#a3a39f]">positiva · {s.receptionErrors} erros diretos</p></div></div>
  </Shell>;
}

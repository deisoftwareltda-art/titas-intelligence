import type { AppState, Rally } from "./types";

const pct = (value: number, total: number) => total ? Math.round((value / total) * 1000) / 10 : 0;

export function matchScore(rallies: Rally[], matchId: string, set: number) {
  const list = rallies.filter(r => r.matchId === matchId && r.set === set);
  return { titas: list.filter(r => r.winner === "TITAS").length, opponent: list.filter(r => r.winner === "ADVERSARIO").length };
}

export function dashboardStats(state: AppState) {
  const finished = state.matches.filter(m => m.status === "FINALIZADA");
  const actions = state.rallies.flatMap(r => r.actions).filter(a => a.team === "TITAS");
  const attacks = actions.filter(a => a.skill === "ATAQUE");
  const receptions = actions.filter(a => a.skill === "RECEPÇÃO");
  const serves = actions.filter(a => a.skill === "SAQUE");
  const blocks = actions.filter(a => a.skill === "BLOQUEIO");
  const attackPoints = attacks.filter(a => a.result === "Ponto").length;
  const attackErrors = attacks.filter(a => a.result === "Erro").length;
  const blocked = attacks.filter(a => a.result === "Bloqueado").length;
  return {
    games: finished.length,
    wins: finished.filter(m => m.titasSets > m.opponentSets).length,
    losses: finished.filter(m => m.titasSets < m.opponentSets).length,
    setsWon: finished.reduce((n, m) => n + m.titasSets, 0),
    setsLost: finished.reduce((n, m) => n + m.opponentSets, 0),
    pointsFor: state.rallies.filter(r => r.winner === "TITAS").length,
    pointsAgainst: state.rallies.filter(r => r.winner === "ADVERSARIO").length,
    attackEfficiency: pct(attackPoints - attackErrors - blocked, attacks.length),
    receptionPositive: pct(receptions.filter(a => ["Perfeita", "Positiva"].includes(a.result)).length, receptions.length),
    aces: serves.filter(a => a.result === "Ace").length,
    serveErrors: serves.filter(a => a.result === "Erro").length,
    blocks: blocks.filter(a => a.result === "Ponto").length,
  };
}

export function rotationStats(state: AppState) {
  return [1, 2, 3, 4, 5, 6].map(rotation => {
    const rallies = state.rallies.filter(r => r.rotation === rotation);
    const won = rallies.filter(r => r.winner === "TITAS").length;
    const serving = rallies.filter(r => r.servingTeam === "TITAS");
    const receiving = rallies.filter(r => r.servingTeam === "ADVERSARIO");
    const actions = rallies.flatMap(r => r.actions);
    const attacks = actions.filter(a => a.skill === "ATAQUE");
    const attackValue = attacks.filter(a => a.result === "Ponto").length - attacks.filter(a => ["Erro", "Bloqueado"].includes(a.result)).length;
    return {
      rotation,
      rallies: rallies.length,
      won,
      lost: rallies.length - won,
      efficiency: pct(won, rallies.length),
      sideOut: pct(receiving.filter(r => r.winner === "TITAS").length, receiving.length),
      breakPoint: pct(serving.filter(r => r.winner === "TITAS").length, serving.length),
      attackEfficiency: pct(attackValue, attacks.length),
      errors: actions.filter(a => a.result.toLowerCase().includes("erro")).length,
    };
  });
}

export function matchStatistics(state: AppState, matchId: string) {
  const rallies = state.rallies.filter(r => r.matchId === matchId);
  const filtered: AppState = { ...state, matches: state.matches.filter(m => m.id === matchId), rallies };
  const base = dashboardStats(filtered);
  const actions = rallies.flatMap(r => r.actions).filter(a => a.team === "TITAS");
  const serves = actions.filter(a => a.skill === "SAQUE");
  const receptions = actions.filter(a => a.skill === "RECEPÇÃO");
  const attacks = actions.filter(a => a.skill === "ATAQUE");
  const receiving = rallies.filter(r => r.servingTeam === "ADVERSARIO");
  const serving = rallies.filter(r => r.servingTeam === "TITAS");
  return {
    ...base,
    rallies: rallies.length,
    sideOut: pct(receiving.filter(r => r.winner === "TITAS").length, receiving.length),
    breakPoint: pct(serving.filter(r => r.winner === "TITAS").length, serving.length),
    perfectReception: pct(receptions.filter(a => a.result === "Perfeita").length, receptions.length),
    receptionErrors: receptions.filter(a => a.result === "Erro direto").length,
    attackAttempts: attacks.length,
    attackPoints: attacks.filter(a => a.result === "Ponto").length,
    attackErrors: attacks.filter(a => a.result === "Erro").length,
    serveAttempts: serves.length,
    rotations: rotationStats(filtered),
  };
}

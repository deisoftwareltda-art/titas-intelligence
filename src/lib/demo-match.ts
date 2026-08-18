import type { Action, AppState, Rally, Skill } from "./types";

function action(index: number, playerId: string, skill: Skill, result: string): Action {
  return { id: `demo-action-${index}-${skill}`, playerId, skill, result, team: "TITAS", createdAt: new Date(2026, 7, 6, 20, 0, index).toISOString() };
}

export function loadDemoSet(current: AppState): AppState {
  const match = current.matches[0];
  if (!match) return current;
  const lineup = match.lineup.length >= 6 ? match.lineup : current.players.slice(0, 6).map(p => p.id);
  const winners: ("TITAS" | "ADVERSARIO")[] = [
    "TITAS","ADVERSARIO","TITAS","TITAS","ADVERSARIO","TITAS","ADVERSARIO","TITAS","TITAS","ADVERSARIO",
    "TITAS","TITAS","ADVERSARIO","TITAS","ADVERSARIO","TITAS","TITAS","ADVERSARIO","TITAS","ADVERSARIO",
    "TITAS","TITAS","ADVERSARIO","TITAS","ADVERSARIO","TITAS","TITAS","ADVERSARIO","ADVERSARIO","TITAS",
    "ADVERSARIO","TITAS","TITAS","ADVERSARIO","TITAS","ADVERSARIO","TITAS","ADVERSARIO","TITAS","TITAS",
    "ADVERSARIO","TITAS","ADVERSARIO","TITAS","TITAS",
  ];
  let home = 0, away = 0, rotation = 1;
  let serving: "TITAS" | "ADVERSARIO" = "TITAS";
  const rallies: Rally[] = winners.map((winner, index) => {
    const playerId = lineup[index % lineup.length];
    const actions: Action[] = [];
    if (serving === "TITAS") actions.push(action(index, playerId, "SAQUE", index % 11 === 0 ? "Ace" : index % 9 === 0 ? "Erro" : "Positivo"));
    else actions.push(action(index, playerId, "RECEPÇÃO", index % 5 === 0 ? "Perfeita" : index % 7 === 0 ? "Negativa" : "Positiva"));
    if (winner === "TITAS") {
      if (index % 8 === 0) actions.push(action(index, lineup[(index + 3) % lineup.length], "BLOQUEIO", "Ponto"));
      else actions.push(action(index, lineup[(index + 1) % lineup.length], "ATAQUE", "Ponto"));
    } else if (index % 4 === 0) actions.push(action(index, lineup[(index + 1) % lineup.length], "ATAQUE", "Erro"));
    else actions.push(action(index, lineup[(index + 2) % lineup.length], "DEFESA", index % 3 === 0 ? "Erro" : "Mantida em jogo"));
    const startHome = home, startAway = away;
    winner === "TITAS" ? home++ : away++;
    const rally: Rally = { id: `demo-rally-${index + 1}`, matchId: match.id, set: 1, startHome, startAway, endHome: home, endAway: away, servingTeam: serving, rotation, winner, actions, createdAt: new Date(2026, 7, 6, 20, 0, index).toISOString() };
    if (winner !== serving) { serving = winner; if (winner === "TITAS") rotation = rotation === 6 ? 1 : rotation + 1; }
    return rally;
  });
  return {
    ...current,
    matches: current.matches.map(m => m.id === match.id ? { ...m, status: "FINALIZADA", titasSets: 1, opponentSets: 0, lineup } : m),
    rallies: [...current.rallies.filter(r => r.matchId !== match.id), ...rallies],
  };
}


import type { AppState } from "./types";

export const initialState: AppState = {
  players: [
    { id: "p1", name: "Caio Nascimento", number: 3, position: "Levantador", height: 187, attackReach: 315, blockReach: 298, dominantHand: "Direita", active: true },
    { id: "p2", name: "Lucas Andrade", number: 7, position: "Ponteiro", height: 194, attackReach: 338, blockReach: 320, dominantHand: "Direita", active: true },
    { id: "p3", name: "Rafael Lima", number: 9, position: "Oposto", height: 198, attackReach: 345, blockReach: 328, dominantHand: "Esquerda", active: true },
    { id: "p4", name: "Bruno Martins", number: 11, position: "Central", height: 202, attackReach: 342, blockReach: 330, dominantHand: "Direita", active: true },
    { id: "p5", name: "João Vitor", number: 14, position: "Ponteiro", height: 192, attackReach: 335, blockReach: 316, dominantHand: "Direita", active: true },
    { id: "p6", name: "Pedro Henrique", number: 18, position: "Central", height: 205, attackReach: 348, blockReach: 336, dominantHand: "Direita", active: true },
    { id: "p7", name: "Mateus Silva", number: 2, position: "Líbero", height: 178, attackReach: 292, blockReach: 281, dominantHand: "Direita", active: true },
  ],
  opponents: [
    { id: "o1", name: "Vôlei Caruaru", city: "Caruaru", state: "PE", competition: "Liga Agreste", coach: "Marcos Rocha" },
    { id: "o2", name: "Náutico Vôlei", city: "Recife", state: "PE", competition: "Pernambucano", coach: "André Costa" },
  ],
  matches: [
    { id: "m1", competition: "Liga Agreste", phase: "Classificatória", date: "2026-08-10", time: "19:30", venue: "Ginásio do SESC Garanhuns", opponentId: "o1", home: true, status: "AGENDADA", titasSets: 0, opponentSets: 0, lineup: ["p1", "p2", "p3", "p4", "p5", "p6"] },
  ],
  rallies: [],
};


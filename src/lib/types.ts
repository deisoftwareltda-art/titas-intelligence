export type Position = "Levantador" | "Oposto" | "Ponteiro" | "Central" | "Líbero";
export type Role = "ADMIN" | "STAFF";
export type Skill = "SAQUE" | "RECEPÇÃO" | "LEVANTAMENTO" | "ATAQUE" | "BLOQUEIO" | "DEFESA" | "ERRO" | "PONTO";

export interface Player { id: string; name: string; number: number; position: Position; birthDate?: string; height?: number; attackReach?: number; blockReach?: number; dominantHand: "Direita" | "Esquerda"; active: boolean; }
export interface Opponent { id: string; name: string; city: string; state: string; competition: string; coach?: string; notes?: string; }
export interface Match { id: string; competition: string; phase: string; date: string; time: string; venue: string; opponentId: string; home: boolean; status: "AGENDADA" | "AO_VIVO" | "FINALIZADA"; titasSets: number; opponentSets: number; lineup: string[]; }
export interface Action { id: string; playerId?: string; skill: Skill; result: string; team: "TITAS" | "ADVERSARIO"; createdAt: string; }
export interface Rally { id: string; matchId: string; set: number; startHome: number; startAway: number; endHome: number; endAway: number; servingTeam: "TITAS" | "ADVERSARIO"; rotation: number; winner: "TITAS" | "ADVERSARIO"; actions: Action[]; createdAt: string; }
export interface AppState { players: Player[]; opponents: Opponent[]; matches: Match[]; rallies: Rally[]; }


export type Language = "en" | "ne";
export type MarriagePlayerStatus = "seen" | "unseen" | "show";

export interface MarriageRound {
  id: string;
  scores: Array<number | null>;
  statuses?: MarriagePlayerStatus[];
}

export interface MarriagePlayerRoundInput {
  status: MarriagePlayerStatus;
  points: number | null;
}

export interface MarriagePlayerRoundResult {
  status: MarriagePlayerStatus;
  enteredPoints: number;
  netPoints: number;
  money: number;
}

export interface MarriageRoundResult {
  players: MarriagePlayerRoundResult[];
  totalPointsWithoutShow: number;
  totalPointsWithShow: number;
  totalPointsDistributed: number;
}

export interface MarriageGameData {
  playerCount: number;
  rate: number;
  players: string[];
  rounds: MarriageRound[];
}

export interface CallBreakEntry {
  called: number;
  won: number;
  bonus: number;
  penalty: number;
}

export interface CallBreakRound {
  id: string;
  entries: CallBreakEntry[];
}

export interface CallBreakGameData {
  players: string[];
  rounds: CallBreakRound[];
}

import type {
  CallBreakEntry,
  CallBreakGameData,
  Language,
  MarriageGameData,
  MarriagePlayerStatus,
  MarriageRound,
} from "@/types/game";

export const STORAGE_VERSION = 1;
export const LANGUAGE_STORAGE_KEY = "taas-language";
export const MARRIAGE_STORAGE_KEY = "taas-marriage";
export const CALL_BREAK_STORAGE_KEY = "taas-call-break";

export function createMarriageData(): MarriageGameData {
  return {
    playerCount: 2,
    rate: 1,
    players: ["Player 1", "Player 2"],
    rounds: [],
  };
}

export function createCallBreakData(): CallBreakGameData {
  return {
    players: ["Player 1", "Player 2", "Player 3", "Player 4"],
    rounds: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isMarriageRound(value: unknown): value is MarriageRound {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    Array.isArray(value.scores) &&
    value.scores.every(
      (score) =>
        score === null || (typeof score === "number" && Number.isFinite(score)),
    ) &&
    (value.statuses === undefined ||
      (Array.isArray(value.statuses) &&
      value.statuses.every(
        (status): status is MarriagePlayerStatus =>
          status === "seen" || status === "unseen" || status === "show",
      ) &&
      value.statuses.length === value.scores.length))
  );
}

function isCallBreakEntry(value: unknown): value is CallBreakEntry {
  return (
    isRecord(value) &&
    typeof value.called === "number" &&
    Number.isFinite(value.called) &&
    typeof value.won === "number" &&
    Number.isFinite(value.won) &&
    typeof value.bonus === "number" &&
    Number.isFinite(value.bonus) &&
    typeof value.penalty === "number" &&
    Number.isFinite(value.penalty)
  );
}

export function isMarriageGameData(value: unknown): value is MarriageGameData {
  return (
    isRecord(value) &&
    typeof value.playerCount === "number" &&
    Number.isInteger(value.playerCount) &&
    value.playerCount >= 2 &&
    value.playerCount <= 5 &&
    typeof value.rate === "number" &&
    Number.isFinite(value.rate) &&
    value.rate > 0 &&
    isStringArray(value.players) &&
    value.players.length === value.playerCount &&
    Array.isArray(value.rounds) &&
    value.rounds.every(
      (round) =>
        isMarriageRound(round) && round.scores.length === value.playerCount,
    )
  );
}

export function isCallBreakGameData(value: unknown): value is CallBreakGameData {
  return (
    isRecord(value) &&
    isStringArray(value.players) &&
    value.players.length === 4 &&
    Array.isArray(value.rounds) &&
    value.rounds.every(
      (round) =>
        isRecord(round) &&
        typeof round.id === "string" &&
        Array.isArray(round.entries) &&
        round.entries.length === 4 &&
        round.entries.every(isCallBreakEntry),
    )
  );
}

export function isLanguage(value: unknown): value is Language | null {
  return value === null || value === "en" || value === "ne";
}

export function encodeStorage<T>(data: T): string {
  return JSON.stringify({ version: STORAGE_VERSION, data });
}

export function decodeStorage<T>(
  serialized: string,
  validate: (value: unknown) => value is T,
): T {
  const parsed: unknown = JSON.parse(serialized);
  if (!isRecord(parsed) || parsed.version !== STORAGE_VERSION) {
    throw new Error("Unsupported or invalid saved data version.");
  }
  if (!validate(parsed.data)) {
    throw new Error("Saved data does not match the expected structure.");
  }
  return parsed.data;
}

import type { CallBreakEntry } from "@/types/game";

export function calculateCallBreakScore(entry: CallBreakEntry): number {
  const baseScore =
    entry.won >= entry.called
      ? entry.called + (entry.won - entry.called) * 0.1
      : -entry.called;

  return Number((baseScore + entry.bonus - entry.penalty).toFixed(2));
}

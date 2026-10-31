import type {
  MarriagePlayerRoundInput,
  MarriageRoundResult,
} from "@/types/game";

export function calculateMarriageRound(
  players: MarriagePlayerRoundInput[],
  ratePerPoint: number,
): MarriageRoundResult | null {
  if (
    players.length === 0 ||
    !Number.isFinite(ratePerPoint) ||
    ratePerPoint <= 0 ||
    players.filter((player) => player.status === "show").length !== 1 ||
    players.some(
      (player) =>
        player.status !== "unseen" &&
        (player.points === null ||
          !Number.isFinite(player.points) ||
          player.points < 0),
    )
  ) {
    return null;
  }

  const showIndex = players.findIndex((player) => player.status === "show");
  const enteredPoints = players.map((player) =>
    player.status === "unseen" ? 0 : player.points ?? 0,
  );
  // The supplied worked example includes the Show player's entered points
  // in this subtotal, despite describing it as points "without Show".
  const totalPointsWithoutShow = enteredPoints.reduce(
    (total, points) => total + points,
    0,
  );
  // The required example adds a single 3-point Show adjustment, independent
  // of how many other players are Seen.
  const totalPointsWithShow = totalPointsWithoutShow + 3;

  const netPoints = players.map((player, index) => {
    if (index === showIndex) return 0;
    if (player.status === "unseen") return -(totalPointsWithoutShow + 10);
    if ((player.points ?? 0) === 0) return -totalPointsWithShow;
    return (player.points ?? 0) * players.length - totalPointsWithShow;
  });
  netPoints[showIndex] = -netPoints.reduce((total, points) => total + points, 0);

  const totalPointsDistributed = netPoints.reduce(
    (total, points) => total + points,
    0,
  );
  const roundToCents = (amount: number) => Number(amount.toFixed(2));

  return {
    players: players.map((player, index) => ({
      status: player.status,
      enteredPoints: enteredPoints[index],
      netPoints: netPoints[index],
      money: roundToCents(netPoints[index] * ratePerPoint),
    })),
    totalPointsWithoutShow,
    totalPointsWithShow,
    totalPointsDistributed,
  };
}

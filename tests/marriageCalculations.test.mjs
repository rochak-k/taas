import assert from "node:assert/strict";
import test from "node:test";
import { calculateMarriageRound } from "../lib/marriageCalculations.ts";

test("matches the four-player Marriage example", () => {
  const result = calculateMarriageRound(
    [
      { status: "seen", points: 10 },
      { status: "show", points: 5 },
      { status: "seen", points: 0 },
      { status: "unseen", points: 0 },
    ],
    2,
  );

  assert.ok(result);
  assert.deepEqual(
    result.players.map((player) => player.netPoints),
    [22, 21, -18, -25],
  );
  assert.deepEqual(
    result.players.map((player) => player.money),
    [44, 42, -36, -50],
  );
  assert.equal(result.totalPointsWithoutShow, 15);
  assert.equal(result.totalPointsWithShow, 18);
  assert.equal(result.totalPointsDistributed, 0);
});

test("adds exactly three points to the subtotal when multiple players are Seen", () => {
  const result = calculateMarriageRound(
    [
      { status: "seen", points: 10 },
      { status: "show", points: 5 },
      { status: "seen", points: 2 },
      { status: "unseen", points: 0 },
    ],
    1,
  );

  assert.ok(result);
  assert.equal(result.totalPointsWithShow - result.totalPointsWithoutShow, 3);
});

test("does not calculate a round without exactly one Show player", () => {
  assert.equal(
    calculateMarriageRound(
      [
        { status: "seen", points: 10 },
        { status: "seen", points: 5 },
      ],
      1,
    ),
    null,
  );
  assert.equal(
    calculateMarriageRound(
      [
        { status: "show", points: 10 },
        { status: "show", points: 5 },
      ],
      1,
    ),
    null,
  );
});

test("rejects negative points for Seen and Show players", () => {
  assert.equal(
    calculateMarriageRound(
      [
        { status: "show", points: 0 },
        { status: "seen", points: -1 },
      ],
      1,
    ),
    null,
  );
});

test("treats Unseen players' entered points as zero", () => {
  const result = calculateMarriageRound(
    [
      { status: "show", points: 2 },
      { status: "unseen", points: 99 },
    ],
    1,
  );

  assert.ok(result);
  assert.equal(result.players[1].enteredPoints, 0);
  assert.equal(result.totalPointsDistributed, 0);
});

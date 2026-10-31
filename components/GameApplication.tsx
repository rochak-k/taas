"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { GameCard } from "@/components/GameCard";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { calculateCallBreakScore } from "@/lib/callbreakCalculations";
import { calculateMarriageRound } from "@/lib/marriageCalculations";
import {
  CALL_BREAK_STORAGE_KEY,
  createCallBreakData,
  createMarriageData,
  isCallBreakGameData,
  isMarriageGameData,
  MARRIAGE_STORAGE_KEY,
} from "@/lib/storage";
import type {
  CallBreakEntry,
  CallBreakGameData,
  Language,
  MarriageGameData,
  MarriagePlayerStatus,
} from "@/types/game";

type GameView = "home" | "marriage" | "call-break";

interface GameApplicationProps {
  view: GameView;
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function formatAmount(amount: number, currency: string) {
  return `${currency} ${amount.toFixed(2)}`;
}

function ScoreValue({ value, currency }: { value: number; currency?: string }) {
  const formatted = currency ? formatAmount(value, currency) : value.toFixed(2);
  const tone = value > 0 ? "positive" : value < 0 ? "negative" : "neutral";
  return <span className={`score-value ${tone}`}>{formatted}</span>;
}

function SignedScoreValue({
  value,
  currency,
}: {
  value: number;
  currency?: string;
}) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  const amount = Math.abs(value).toFixed(currency ? 2 : Number.isInteger(value) ? 0 : 2);
  return (
    <span className={`score-value ${value > 0 ? "positive" : value < 0 ? "negative" : "neutral"}`}>
      {currency ? `${currency} ` : ""}
      {sign}{amount}
    </span>
  );
}

function SummaryMoneyValue({
  value,
  currency,
}: {
  value: number;
  currency: string;
}) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return (
    <span className={`score-value ${value > 0 ? "positive" : value < 0 ? "negative" : "neutral"}`}>
      {sign}{currency} {Math.abs(value).toFixed(2)}
    </span>
  );
}

export function GameApplication({ view }: GameApplicationProps) {
  const {
    language,
    text,
    loaded: languageLoaded,
    hasSelectedLanguage,
    chooseLanguage,
    storageError: languageStorageError,
  } = useLanguage();
  const [marriage, setMarriage, marriageLoaded, marriageStorageError] =
    useLocalStorage<MarriageGameData>(
      MARRIAGE_STORAGE_KEY,
      createMarriageData(),
      isMarriageGameData,
    );
  const [callBreak, setCallBreak, callBreakLoaded, callBreakStorageError] =
    useLocalStorage<CallBreakGameData>(
      CALL_BREAK_STORAGE_KEY,
      createCallBreakData(),
      isCallBreakGameData,
    );
  const [openAdjustments, setOpenAdjustments] = useState<string[]>([]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const isLoaded = languageLoaded && marriageLoaded && callBreakLoaded;
  const storageError =
    languageStorageError || marriageStorageError || callBreakStorageError;

  if (!isLoaded) {
    return (
      <main className="loading-screen" aria-live="polite">
        <span className="brand-mark" aria-hidden="true">♠</span>
        <p>{text.loading}</p>
      </main>
    );
  }

  if (!hasSelectedLanguage) {
    return <LanguageSelection chooseLanguage={chooseLanguage} text={text} />;
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label={text.home}>
          <span className="brand-mark" aria-hidden="true">♠</span>
          <span>{text.appName}</span>
        </Link>
        <div className="header-actions">
          {view !== "home" && (
            <Link href="/" className="header-link">
              <span aria-hidden="true">←</span> {text.backHome}
            </Link>
          )}
          <div className="language-switch" aria-label={text.language}>
            <button
              type="button"
              onClick={() => chooseLanguage("en")}
              className={language === "en" ? "language-active" : ""}
              aria-pressed={language === "en"}
            >
              {text.languageEnglish}
            </button>
            <button
              type="button"
              onClick={() => chooseLanguage("ne")}
              className={language === "ne" ? "language-active" : ""}
              aria-pressed={language === "ne"}
            >
             {text.languageNepali}
            </button>
          </div>
        </div>
      </header>

      {storageError && (
        <p className="storage-warning" role="alert">{text.storageWarning}</p>
      )}
      {view === "home" && <HomeScreen text={text} />}
      {view === "marriage" && (
        <MarriageTracker
          data={marriage}
          setData={setMarriage}
          text={text}
        />
      )}
      {view === "call-break" && (
        <CallBreakTracker
          data={callBreak}
          setData={setCallBreak}
          text={text}
          openAdjustments={openAdjustments}
          setOpenAdjustments={setOpenAdjustments}
        />
      )}
    </div>
  );
}

function LanguageSelection({
  chooseLanguage,
  text,
}: {
  chooseLanguage: (language: Language) => void;
  text: ReturnType<typeof useLanguage>["text"];
}) {
  return (
    <main className="language-screen">
      <div className="language-card">
        <span className="brand-mark language-mark" aria-hidden="true">♠</span>
        <h1>{text.chooseLanguage}</h1>
        <p>{text.chooseLanguageDescription}</p>
        <div className="language-options">
          <button type="button" className="language-option" onClick={() => chooseLanguage("en")}>
            <span aria-hidden="true"></span>
            <span>{text.english}</span>
          </button>
          <button type="button" className="language-option" onClick={() => chooseLanguage("ne")}>
            <span aria-hidden="true">🇳🇵</span>
            <span>{text.nepali}</span>
          </button>
        </div>
      </div>
    </main>
  );
}

function HomeScreen({ text }: { text: ReturnType<typeof useLanguage>["text"] }) {
  return (
    <main className="page-content home-content">
      <div className="page-heading">
        <p className="eyebrow">{text.selectGame}</p>
        <h1>{text.homeIntroduction}</h1>
      </div>
      <section className="game-card-grid" aria-label={text.selectGame}>
        <GameCard
          href="/marriage"
          title={text.marriage}
          description={text.marriageDescription}
          symbol="♥"
          color="red"
        />
        <GameCard
          href="/call-break"
          title={text.callBreak}
          description={text.callBreakDescription}
          symbol="♠"
          color="blue"
        />
      </section>
      <p className="home-note"><span aria-hidden="true">●</span> {text.saving}</p>
    </main>
  );
}

function MarriageTracker({
  data,
  setData,
  text,
}: {
  data: MarriageGameData;
  setData: React.Dispatch<React.SetStateAction<MarriageGameData>>;
  text: ReturnType<typeof useLanguage>["text"];
}) {
  const [rateDraft, setRateDraft] = useState<string | null>(null);

  const roundResults = useMemo(
    () =>
      data.rounds.map((round) =>
        calculateMarriageRound(
          round.scores.map((points, index) => ({
            status: round.statuses?.[index] ?? "seen",
            points,
          })),
          data.rate,
        ),
      ),
    [data.rate, data.rounds],
  );
  const playerTotals = data.players.map((_, playerIndex) =>
    roundResults.reduce(
      (total, result) => total + (result?.players[playerIndex]?.netPoints ?? 0),
      0,
    ),
  );
  const completedGames = roundResults.filter((result) => result !== null).length;
  const winnerIndex = playerTotals.length
    ? playerTotals.indexOf(Math.max(...playerTotals))
    : -1;
  const tiedForWinner =
    playerTotals.filter((total) => total === Math.max(...playerTotals)).length > 1;
  const marriageWinnerNames = data.players.flatMap((player, index) =>
    playerTotals[index] === Math.max(...playerTotals)
      ? [player || `${text.player} ${index + 1}`]
      : [],
  );

  function updatePlayerCount(count: number) {
    if (count === data.playerCount) return;
    if (data.rounds.length && !window.confirm(text.confirmPlayerCountChange)) return;
    setData((current) => ({
      ...current,
      playerCount: count,
      players: Array.from(
        { length: count },
        (_, index) => current.players[index] ?? `Player ${index + 1}`,
      ),
      rounds: current.rounds.length ? [] : current.rounds.map((round) => ({
        ...round,
        scores: Array.from({ length: count }, () => null),
        statuses: Array.from({ length: count }, () => "seen" as const),
      })),
    }));
  }

  function addRound() {
    setData((current) => ({
      ...current,
      rounds: [
        ...current.rounds,
        {
          id: createId(),
          scores: Array.from({ length: current.playerCount }, () => 0),
          statuses: Array.from({ length: current.playerCount }, () => "seen" as const),
        },
      ],
    }));
  }

  function updateScore(roundId: string, playerIndex: number, rawValue: string) {
    const score = rawValue === "" ? null : Number(rawValue);
    if (score !== null && (!Number.isFinite(score) || score < 0)) return;
    setData((current) => ({
      ...current,
      rounds: current.rounds.map((round) =>
        round.id === roundId
          ? {
              ...round,
              scores: round.scores.map((value, index) =>
                index === playerIndex ? score : value,
              ),
            }
          : round,
      ),
    }));
  }

  function updateStatus(
    roundId: string,
    playerIndex: number,
    status: MarriagePlayerStatus,
  ) {
    setData((current) => ({
      ...current,
      rounds: current.rounds.map((item) => {
        if (item.id !== roundId) return item;
        const currentStatuses = item.scores.map(
          (_, index) => item.statuses?.[index] ?? "seen",
        );
        if (
          status === "show" &&
          currentStatuses.some(
            (currentStatus, index) =>
              index !== playerIndex && currentStatus === "show",
          )
        ) {
          return item;
        }
        return {
          ...item,
          scores: item.scores.map((score, index) =>
            index === playerIndex && status === "unseen" ? 0 : score,
          ),
          statuses: item.scores.map((_, index) =>
            index === playerIndex
              ? status
              : item.statuses?.[index] ?? "seen",
          ),
        };
      }),
    }));
  }

  function reset() {
    if (window.confirm(text.confirmResetGame)) {
      setData(createMarriageData());
      setRateDraft(null);
    }
  }

  return (
    <main className="page-content tracker-content">
      <div className="tracker-title-row">
        <div className="page-heading">
          <p className="eyebrow">{text.game}</p>
          <h1><span className="title-suit red-suit" aria-hidden="true">♥</span> {text.marriage}</h1>
          <p>{text.marriageInstructions}</p>
        </div>
        <button type="button" className="button button-danger-outline" onClick={reset}>
          {text.resetGame}
        </button>
      </div>

      <section className="panel setup-panel" aria-label={text.players}>
        <div className="setup-field">
          <span className="field-label">{text.playerCount}</span>
          <div className="choice-row">
            {[2, 3, 4, 5].map((count) => (
              <button
                type="button"
                key={count}
                className={`choice-button ${data.playerCount === count ? "choice-selected" : ""}`}
                onClick={() => updatePlayerCount(count)}
                aria-pressed={data.playerCount === count}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
        <label className="setup-field rate-field">
          <span className="field-label">{text.ratePerPoint}</span>
          <span className="rate-input-wrap">
            <span>{text.rupees}</span>
            <input
              aria-label={text.ratePerPoint}
              type="number"
              min="0.01"
              step="any"
              value={rateDraft ?? String(data.rate)}
              onChange={(event) => setRateDraft(event.target.value)}
              onBlur={() => {
                const rate = Number(rateDraft ?? data.rate);
                if (Number.isFinite(rate) && rate > 0) {
                  setData((current) => ({ ...current, rate }));
                }
                setRateDraft(null);
              }}
            />
            <span>/ {text.points}</span>
          </span>
          <span className="field-help">{text.rateHelp}</span>
        </label>
      </section>

      <section className="panel player-names-panel">
        <h2>{text.players}</h2>
        <div className="player-name-grid">
          {data.players.map((player, index) => (
            <label className="player-name-field" key={index}>
              <span>{text.player} {index + 1}</span>
              <input
                type="text"
                value={player}
                maxLength={32}
                aria-label={`${text.editName} ${index + 1}`}
                onChange={(event) =>
                  setData((current) => ({
                    ...current,
                    players: current.players.map((name, playerIndex) =>
                      playerIndex === index ? event.target.value : name,
                    ),
                  }))
                }
              />
            </label>
          ))}
        </div>
      </section>

      <div className="section-title-row">
        <h2>{text.games}</h2>
        <button type="button" className="button button-primary" onClick={addRound}>
          <span aria-hidden="true">＋</span> {text.addGame}
        </button>
      </div>
      {data.rounds.length === 0 ? (
        <div className="empty-state panel">
          <span className="empty-symbol" aria-hidden="true">♡</span>
          <p>{text.emptyGames}</p>
        </div>
      ) : (
        <div className="round-list">
          {data.rounds.map((round, roundIndex) => {
            const result = roundResults[roundIndex];
            const statuses = round.scores.map(
              (_, index) => round.statuses?.[index] ?? "seen",
            );
            const showCount = statuses.filter((status) => status === "show").length;
            const hasMissingPoints = round.scores.some(
              (points, index) =>
                statuses[index] !== "unseen" &&
                (points === null || !Number.isFinite(points) || points < 0),
            );
            return (
              <section className="panel marriage-round" key={round.id}>
                <div className="round-card-heading">
                  <h3>{text.game} {roundIndex + 1}</h3>
                  <button
                    type="button"
                    className="button button-delete"
                    onClick={() => {
                      if (window.confirm(text.confirmDeleteRound)) {
                        setData((current) => ({
                          ...current,
                          rounds: current.rounds.filter((item) => item.id !== round.id),
                        }));
                      }
                    }}
                  >
                    {text.delete}
                  </button>
                </div>
                <div className="marriage-round-players">
                  {data.players.map((player, playerIndex) => {
                    const name = player || `${text.player} ${playerIndex + 1}`;
                    const status = statuses[playerIndex];
                    const playerResult = result?.players[playerIndex];
                    const anotherShowSelected =
                      showCount > 0 && status !== "show";
                    return (
                      <div className="marriage-player-line" key={playerIndex}>
                        <strong className="marriage-player-name">{name}</strong>
                        <div className="marriage-status-field">
                          <span className="marriage-field-label">{text.status}</span>
                          <div className="marriage-status-control">
                            {(
                              [
                                ["seen", text.seen],
                                ["unseen", text.unseen],
                                ["show", text.show],
                              ] as const
                            ).map(([value, label]) => (
                              <button
                                type="button"
                                key={value}
                                className={`marriage-status-button ${status === value ? "status-selected" : ""}`}
                                aria-pressed={status === value}
                                disabled={value === "show" && anotherShowSelected}
                                aria-label={`${name}: ${label}`}
                                onClick={() =>
                                  updateStatus(round.id, playerIndex, value)
                                }
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <label className="marriage-points-field">
                          <span className="marriage-field-label">{text.points}</span>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            disabled={status === "unseen"}
                            aria-label={`${name} ${text.points} ${text.game} ${roundIndex + 1}`}
                            value={
                              status === "unseen"
                                ? 0
                                : round.scores[playerIndex] ?? ""
                            }
                            onChange={(event) =>
                              updateScore(round.id, playerIndex, event.target.value)
                            }
                          />
                        </label>
                        <div className="marriage-round-results">
                          <div>
                            <span>{text.netPoints}</span>
                            {playerResult ? (
                              <SignedScoreValue value={playerResult.netPoints} />
                            ) : (
                              <span className="muted-result">—</span>
                            )}
                          </div>
                          <div>
                            <span>{text.amountToReceiveOrPay}</span>
                            {playerResult ? (
                              <SignedScoreValue
                                value={playerResult.money}
                                currency={text.rupees}
                              />
                            ) : (
                              <span className="muted-result">—</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {!result && (
                  <p className="round-help" role="status">
                    {showCount === 0
                      ? text.selectOneShow
                      : showCount > 1
                        ? text.selectOnlyOneShow
                        : hasMissingPoints
                          ? text.enterValidPoints
                          : text.incompleteRound}
                  </p>
                )}
                {result && (
                  <div className="marriage-round-totals">
                    <SummaryStat
                      label={text.totalPointsWithoutShow}
                      value={String(result.totalPointsWithoutShow)}
                    />
                    <SummaryStat
                      label={text.totalPointsWithShow}
                      value={String(result.totalPointsWithShow)}
                    />
                    <SummaryStat
                      label={text.totalPointsDistributed}
                      value={String(result.totalPointsDistributed)}
                    />
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <section className="panel summary-panel">
        <div className="section-title-row summary-heading">
          <h2>{text.overallSummary}</h2>
          <div className="summary-header-metrics">
            <span>{text.gamesPlayed}: {completedGames}</span>
            <span>{text.ratePerPointSummary}: {text.rupees} {data.rate}</span>
          </div>
        </div>
        {completedGames === 0 ? (
          <div className="summary-empty-state">
            <span aria-hidden="true">♡</span>
            <p>{text.noCompletedGames}</p>
          </div>
        ) : (
          <>
            <section className="summary-section">
              <h3>{text.playerResults}</h3>
              <div className="marriage-summary-cards">
                {data.players.map((player, index) => {
                  const gamesWon = roundResults.filter(
                    (result) => (result?.players[index]?.netPoints ?? 0) > 0,
                  ).length;
                  const gamesLost = roundResults.filter(
                    (result) => (result?.players[index]?.netPoints ?? 0) < 0,
                  ).length;
                  const netMoney = Number(
                    (playerTotals[index] * data.rate).toFixed(2),
                  );
                  return (
                    <article className="summary-player-card marriage-summary-card" key={index}>
                      <h4>{player || `${text.player} ${index + 1}`}</h4>
                      <div className="summary-primary-values">
                        <div>
                          <span>{text.netPoints}</span>
                          <SignedScoreValue value={playerTotals[index]} />
                        </div>
                        <div>
                          <span>
                            {netMoney >= 0 ? text.totalEarnings : text.totalLoss}
                          </span>
                          <SummaryMoneyValue value={netMoney} currency={text.rupees} />
                        </div>
                      </div>
                      <div className="summary-stat-grid">
                        <SummaryMetric
                          label={text.gamesPlayedByPlayer}
                          value={String(completedGames)}
                        />
                        <SummaryMetric label={text.gamesWon} value={String(gamesWon)} />
                        <SummaryMetric label={text.gamesLost} value={String(gamesLost)} />
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="summary-winner">
              <span className="summary-winner-icon" aria-hidden="true">♛</span>
              <div className="summary-winner-copy">
                <span>{text.overallWinner}</span>
                <strong>
                  {tiedForWinner
                    ? `${text.tie}: ${marriageWinnerNames.join(", ")}`
                    : data.players[winnerIndex] || `${text.player} ${winnerIndex + 1}`}
                </strong>
              </div>
              <div className="summary-winner-result">
                <SignedScoreValue value={playerTotals[winnerIndex]} />
                <SummaryMoneyValue
                  value={Number((playerTotals[winnerIndex] * data.rate).toFixed(2))}
                  currency={text.rupees}
                />
              </div>
            </section>

            <details className="summary-details">
              <summary>{text.detailedBreakdown}</summary>
              <div className="summary-detail-table-wrap">
                <table className="summary-detail-table">
                  <thead>
                    <tr>
                      <th>{text.players}</th>
                      <th>{text.total} {text.points}</th>
                      <th>{text.ratePerPointSummary}</th>
                      <th>{text.netAmountLabel}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.players.map((player, index) => (
                      <tr key={index}>
                        <th scope="row">{player || `${text.player} ${index + 1}`}</th>
                        <td><SignedScoreValue value={playerTotals[index]} /></td>
                        <td>{text.rupees} {data.rate}</td>
                        <td>
                          <SummaryMoneyValue
                            value={Number((playerTotals[index] * data.rate).toFixed(2))}
                            currency={text.rupees}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </>
        )}
      </section>
    </main>
  );
}

function CallBreakTracker({
  data,
  setData,
  text,
  openAdjustments,
  setOpenAdjustments,
}: {
  data: CallBreakGameData;
  setData: React.Dispatch<React.SetStateAction<CallBreakGameData>>;
  text: ReturnType<typeof useLanguage>["text"];
  openAdjustments: string[];
  setOpenAdjustments: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const totals = data.players.map((_, playerIndex) =>
    data.rounds.reduce(
      (total, round) => total + calculateCallBreakScore(round.entries[playerIndex]),
      0,
    ),
  );
  const summaryTotals = totals.map((total) => Number(total.toFixed(2)));
  const highestIndex = summaryTotals.indexOf(Math.max(...summaryTotals));
  const tiedForHighest =
    summaryTotals.filter((total) => total === Math.max(...summaryTotals)).length > 1;
  const callBreakLeaderNames = data.players.flatMap((player, index) =>
    summaryTotals[index] === Math.max(...summaryTotals)
      ? [player || `${text.player} ${index + 1}`]
      : [],
  );
  const playerRoundScores = data.players.map((_, playerIndex) =>
    data.rounds.map((round) => calculateCallBreakScore(round.entries[playerIndex])),
  );
  const playerCallStats = data.players.map((_, playerIndex) => {
    const roundScores = playerRoundScores[playerIndex];
    const entries = data.rounds.map((round) => round.entries[playerIndex]);
    return {
      successful: entries.filter((entry) => entry.won >= entry.called).length,
      failed: entries.filter((entry) => entry.won < entry.called).length,
      highestRoundScore: roundScores.length ? Math.max(...roundScores) : 0,
      lowestRoundScore: roundScores.length ? Math.min(...roundScores) : 0,
      average: roundScores.length
        ? totals[playerIndex] / roundScores.length
        : 0,
      roundsPlayed: roundScores.length,
    };
  });
  const leaderboard = data.players
    .map((player, index) => ({ player, index, total: summaryTotals[index] }))
    .sort((left, right) => right.total - left.total);

  function addRound() {
    setData((current) => ({
      ...current,
      rounds: [
        ...current.rounds,
        {
          id: createId(),
          entries: Array.from({ length: 4 }, () => ({
            called: 0,
            won: 0,
            bonus: 0,
            penalty: 0,
          })),
        },
      ],
    }));
  }

  function updateEntry(
    roundId: string,
    playerIndex: number,
    field: keyof CallBreakEntry,
    rawValue: string,
  ) {
    const value = rawValue === "" ? 0 : Number(rawValue);
    if (!Number.isFinite(value) || value < 0) return;
    if ((field === "called" || field === "won") && (!Number.isInteger(value) || value > 13)) {
      return;
    }
    setData((current) => ({
      ...current,
      rounds: current.rounds.map((round) =>
        round.id === roundId
          ? {
              ...round,
              entries: round.entries.map((entry, index) =>
                index === playerIndex ? { ...entry, [field]: value } : entry,
              ),
            }
          : round,
      ),
    }));
  }

  function reset() {
    if (window.confirm(text.confirmResetGame)) {
      setData(createCallBreakData());
      setOpenAdjustments([]);
    }
  }

  return (
    <main className="page-content tracker-content">
      <div className="tracker-title-row">
        <div className="page-heading">
          <p className="eyebrow">{text.game}</p>
          <h1><span className="title-suit blue-suit" aria-hidden="true">♠</span> {text.callBreak}</h1>
          <p>{text.callBreakInstructions}</p>
        </div>
        <button type="button" className="button button-danger-outline" onClick={reset}>
          {text.resetGame}
        </button>
      </div>

      <section className="panel player-names-panel">
        <h2>{text.players}</h2>
        <div className="player-name-grid call-player-name-grid">
          {data.players.map((player, index) => (
            <label className="player-name-field" key={index}>
              <span>{text.player} {index + 1}</span>
              <input
                type="text"
                value={player}
                maxLength={32}
                aria-label={`${text.editName} ${index + 1}`}
                onChange={(event) =>
                  setData((current) => ({
                    ...current,
                    players: current.players.map((name, playerIndex) =>
                      playerIndex === index ? event.target.value : name,
                    ),
                  }))
                }
              />
            </label>
          ))}
        </div>
      </section>

      <div className="section-title-row">
        <h2>{text.roundsPlayed}</h2>
        <button type="button" className="button button-primary" onClick={addRound}>
          <span aria-hidden="true">＋</span> {text.addRound}
        </button>
      </div>
      {data.rounds.length === 0 ? (
        <div className="empty-state panel">
          <span className="empty-symbol" aria-hidden="true">♠</span>
          <p>{text.emptyRounds}</p>
        </div>
      ) : (
        <div className="round-list">
          {data.rounds.map((round, roundIndex) => {
            const expanded = openAdjustments.includes(round.id);
            return (
              <section className="panel call-round" key={round.id}>
                <div className="round-card-heading">
                  <h3>{text.round} {roundIndex + 1}</h3>
                  <button
                    type="button"
                    className="button button-delete"
                    onClick={() => {
                      if (window.confirm(text.confirmDeleteRound)) {
                        setData((current) => ({
                          ...current,
                          rounds: current.rounds.filter((item) => item.id !== round.id),
                        }));
                        setOpenAdjustments((current) =>
                          current.filter((id) => id !== round.id),
                        );
                      }
                    }}
                  >
                    {text.delete}
                  </button>
                </div>
                <div className="call-round-labels" aria-hidden="true">
                  <span>{text.players}</span>
                  <span>{text.called}</span>
                  <span>{text.won}</span>
                  <span>{text.score}</span>
                </div>
                <div className="call-player-list">
                  {round.entries.map((entry, playerIndex) => (
                    <div className="call-player-row" key={playerIndex}>
                      <span className="call-player-name">
                        {data.players[playerIndex] || `${text.player} ${playerIndex + 1}`}
                      </span>
                      <label className="call-input">
                        <span className="visually-hidden">{text.called}</span>
                        <input
                          type="number"
                          min="0"
                          max="13"
                          step="1"
                          aria-label={`${data.players[playerIndex] || `${text.player} ${playerIndex + 1}`} ${text.called} ${text.round} ${roundIndex + 1}`}
                          value={entry.called}
                          onChange={(event) =>
                            updateEntry(round.id, playerIndex, "called", event.target.value)
                          }
                        />
                      </label>
                      <label className="call-input">
                        <span className="visually-hidden">{text.won}</span>
                        <input
                          type="number"
                          min="0"
                          max="13"
                          step="1"
                          aria-label={`${data.players[playerIndex] || `${text.player} ${playerIndex + 1}`} ${text.won} ${text.round} ${roundIndex + 1}`}
                          value={entry.won}
                          onChange={(event) =>
                            updateEntry(round.id, playerIndex, "won", event.target.value)
                          }
                        />
                      </label>
                      <span className="call-player-score">
                        <ScoreValue value={calculateCallBreakScore(entry)} />
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="adjustment-toggle"
                  aria-expanded={expanded}
                  onClick={() =>
                    setOpenAdjustments((current) =>
                      expanded
                        ? current.filter((id) => id !== round.id)
                        : [...current, round.id],
                    )
                  }
                >
                  <span aria-hidden="true">{expanded ? "−" : "+"}</span>
                  {text.bonusPenalty}
                </button>
                {expanded && (
                  <div className="adjustments-grid">
                    {round.entries.map((entry, playerIndex) => (
                      <div className="adjustment-player" key={playerIndex}>
                        <strong>{data.players[playerIndex] || `${text.player} ${playerIndex + 1}`}</strong>
                        <label>
                          <span>{text.bonus}</span>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={entry.bonus}
                            aria-label={`${data.players[playerIndex] || `${text.player} ${playerIndex + 1}`} ${text.bonus}`}
                            onChange={(event) =>
                              updateEntry(round.id, playerIndex, "bonus", event.target.value)
                            }
                          />
                        </label>
                        <label>
                          <span>{text.penalty}</span>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={entry.penalty}
                            aria-label={`${data.players[playerIndex] || `${text.player} ${playerIndex + 1}`} ${text.penalty}`}
                            onChange={(event) =>
                              updateEntry(round.id, playerIndex, "penalty", event.target.value)
                            }
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <section className="panel summary-panel">
        <div className="section-title-row summary-heading">
          <h2>{text.overallSummary}</h2>
          <div className="summary-header-metrics">
            <span>{text.totalRoundsPlayed}: {data.rounds.length}</span>
            <span>
              {text.highestScoringPlayer}:{" "}
              {!data.rounds.length
                ? text.noWinner
                : tiedForHighest
                  ? `${text.tie}: ${callBreakLeaderNames.join(", ")}`
                  : data.players[highestIndex] || `${text.player} ${highestIndex + 1}`}
            </span>
          </div>
        </div>
        <section className="summary-section call-summary-section">
          <h3>{text.playerResults}</h3>
          <div className="call-summary-grid">
            {leaderboard.map(({ player, index, total }) => {
              const isWinner =
                data.rounds.length > 0 && total === Math.max(...summaryTotals);
              return (
                <article
                  className={`call-summary-card${isWinner ? " call-summary-card-winner" : ""}`}
                  key={index}
                >
                  <div className="call-summary-card-heading">
                    <h4>{player || `${text.player} ${index + 1}`}</h4>
                    {isWinner && (
                      <span className="call-summary-winner-tag">
                        {text.overallWinner}
                      </span>
                    )}
                  </div>
                  <div className="call-summary-score">
                    <span>{text.totalScore}</span>
                    <FixedScoreValue value={total} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <details className="summary-details call-summary-details">
          <summary>{text.moreStatistics}</summary>
          <div className="call-statistics-grid">
            {leaderboard.map(({ player, index }) => {
              const stats = playerCallStats[index];
              return (
                <article className="call-statistics-card" key={index}>
                  <h4>{player || `${text.player} ${index + 1}`}</h4>
                  <div className="call-statistics-values">
                    <SummaryMetric
                      label={text.successfulCalls}
                      value={String(stats.successful)}
                    />
                    <SummaryMetric
                      label={text.failedCalls}
                      value={String(stats.failed)}
                    />
                    <SummaryMetric
                      label={text.averageScorePerRound}
                      value={stats.average.toFixed(2)}
                    />
                    <SummaryMetric
                      label={text.highestSingleRoundScore}
                      value={stats.highestRoundScore.toFixed(2)}
                    />
                    <SummaryMetric
                      label={text.lowestSingleRoundScore}
                      value={stats.lowestRoundScore.toFixed(2)}
                    />
                    <SummaryMetric
                      label={text.totalRoundsPlayed}
                      value={String(stats.roundsPlayed)}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </details>
      </section>
    </main>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FixedScoreValue({ value }: { value: number }) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  const tone = value > 0 ? "positive" : value < 0 ? "negative" : "neutral";
  return (
    <span className={`score-value ${tone}`}>
      {sign}{Math.abs(value).toFixed(2)}
    </span>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

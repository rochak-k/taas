# Taas — Marriage & Call Break Score Tracker

A mobile-friendly Next.js app for keeping Marriage and Call Break scores. English
and Nepali are supported, and game data is saved in the browser.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Run `npm run lint` and
`npm run build` to validate the application.

## Game scoring

- **Marriage:** Each round requires exactly one Show player. Unseen players'
  entered points count as zero. The supplied worked example includes the Show
  player's points in the "without Show" subtotal and adds 3 only for a
  positive-point Seen player other than Show; the calculation follows that
  example so its required results are reproduced. The Show player's balance
  is the negative sum of all other balances, so every completed round is
  zero-sum. Incomplete rounds are excluded from cumulative totals.
- **Call Break:** meeting the call scores the called tricks plus `0.1` per
  additional trick; missing the call subtracts the called tricks. Optional
  bonuses are added and penalties are subtracted.

Both scoring functions are isolated in `lib/marriageCalculations.ts` and
`lib/callbreakCalculations.ts`.

## Browser storage

Language, Marriage, and Call Break data use separate local-storage keys. Game
records are saved in versioned envelopes; invalid or newer unsupported data is
left untouched and a warning is shown instead of silently overwriting it.
Clearing browser storage removes saved game data.

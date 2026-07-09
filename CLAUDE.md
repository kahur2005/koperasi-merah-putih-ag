# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server (this is the primary workflow)
- `npm run build` — production build into `dist/`
- `npm run preview` — serve the production build locally

There is **no test suite, linter, or formatter** configured. Do not invent commands for them.

Note: `vite.config.js` is listed in `.gitignore`, so local edits to it are untracked. It contains an `allowedHosts` entry for a Cloudflare tunnel used when sharing the dev server.

## What this is

A single-page, client-only browser game: **Koperasi Merah Putih Simulator** — an educational business-simulation about running an Indonesian village cooperative over one in-game year (365 days). There is no backend, no persistence, and no routing; all state lives in memory and resets on reload.

All user-facing text is **Bahasa Indonesia**. Domain vocabulary appears throughout the code (variable names, keys, comments): `anggota` = member, `pinjaman` = loan, `pasar/pasokan` = market/supply, `bagiHasil` = profit-sharing, `kebahagiaan/happiness`, `simpanan` = savings, `stok`, `harga` = price.

## Architecture

**Stack:** React 19 + Vite. State via a single Zustand store. 3D store view via `@react-three/fiber` + `@react-three/drei` (Three.js). Dates via `dayjs`. No TypeScript despite a stray `assets/typescript.svg`.

### The store is the whole game engine

`src/store/gameStore.js` is by far the most important file. It is a single Zustand store holding **all** game state and **all** game logic — the React components are essentially a thin view/controller layer that read state and call store actions. When reasoning about game behavior, start here, not in the components.

Key structural facts about the store:
- `createInitialState()` defines the entire state shape; `resetGame()` restores it.
- Actions are numbered in comment banners (1–21). The two that contain the real simulation are:
  - **`endDay()`** — simulates a day of customer sales: computes customers from cashiers, sells stock, adjusts happiness from pricing markup, applies active-event penalties, builds the `dayReport`, advances the date, and checks lose conditions. Opens either the `laporanHarian` (daily report) or, at month-end, `bagiHasil` (profit-sharing) modal.
  - **`startNewDay()`** — the between-days/month-rollover engine: resets supplier stock, randomizes UMKM prices, generates member applications and loan requests, and on the 1st of the month processes monthly savings, loan repayments, and schedules events (Gagal Panen, Krisis Ekonomi). Checks the win condition on day ≥ 365.
- The daily loop is: `endDay()` → report/bagiHasil modal → (`processBagiHasil()` if month-end) → `startNewDay()`.

### Views

`src/App.jsx` switches between exactly two top-level views based on `currentView` in the store:
- `dashboard` (`components/dashboard/Dashboard.jsx`) — the 2D HUD: top bar, event banners, sidebar buttons, bottom cards for pending applications/loans, and the "Akhiri Hari" (End Day) button. It renders all HUD **modals** conditionally on `activeModal` (e.g. `pasar`, `harga`, `kalender`, `laporanHarian`, `bagiHasil`, `museum`, `gameOver`).
- `store3d` (`components/store3d/StoreScene.jsx`) — the Three.js `<Canvas>` for placing/arranging furniture. Furniture placement uses a "placement mode" flow in the store (`startPlacement` → ghost preview → `confirmPlacement`). Coordinates are stored as integer `x`/`y` in a 0–100 (small) / 0–200 (large) space and mapped to Three.js world units.

Component folders: `components/hud/` (dashboard panels/modals), `components/store3d/` (3D scene + furniture), `components/story/` (narrative overlays).

### Content / config layers (edit these to tune the game)

- `src/constants/gameConstants.js` — all "magic numbers": starting money/happiness, supplier prices & stock, furniture definitions (price, stock/happiness/customer bonuses, `maxCount`), store upgrade cost, event parameters, and `WIN_CONDITIONS`.
- `src/constants/uiStrings.js` — centralized Bahasa Indonesia UI text (`UI.*`). Add new user-facing strings here rather than hardcoding.
- `src/data/npcData.js` — the 8 core NPC members (name, job, income, avatar, `loanTemplates`).
- `src/data/storyChapters.js` — chapter goals; each goal has a `select(state)` predicate evaluated against the live store to drive `ChapterProgress` / `AdvisoryMemo`.
- `src/data/museumContent.js` — historical museum panel content.
- `src/utils/formatRupiah.js`, `src/utils/random.js` — currency formatting and RNG helpers (`randomInt`, `pickRandom`, `shuffleArray`, `seededRandom`).

### Narrative system

Story "moments" are queued through the store, not the components. Actions like `acceptMember`, `buySupply`, `endDay`, and `startNewDay` call the internal `storyMomentPatch(state, id, moment)` helper, which fires a one-time dialog (guarded by `storyFlags[id]`) that surfaces via `components/story/StoryMoment.jsx`. A moment can carry an `actionView`/`actionModal` to deep-link the player to a screen.

## Conventions & gotchas

- **Item keys are always** `rice`, `cookingOil`, `lpgGas` across stock, prices, suppliers, and furniture bonuses. Keep them consistent when adding logic.
- **Suppliers are `PT` vs `UMKM`.** Buying from UMKM raises happiness (+2) and supports the "buy local" mechanic (e.g. Gagal Panen requires a UMKM purchase that day to avoid a large happiness penalty); PT lowers happiness (−2). Successful UMKM-related loans permanently lower that item's UMKM base price and raise its stock.
- **Happiness is always clamped 0–100** via the `clamp()` helper; money/happiness hitting bounds triggers lose conditions in `endDay`.
- **Win/lose values appear in two places.** `endDay`/`startNewDay` read `WIN_CONDITIONS` from constants but also contain hardcoded fallbacks (e.g. `wc.MONEY || 50000000`) that do **not** match `gameConstants.js` (`MONEY: 10_000_000`). If you change win targets, update both the constant and verify the fallback isn't silently overriding it.
- Assets are served from `public/assets/` (avatars, UI button images, museum images, textures) and referenced by absolute path (e.g. `/assets/avatars/female_1_siti.jpg`).
- `implementation_plan.md` and `npc_avatar_gallery.md` at the repo root are design/reference docs, not code.

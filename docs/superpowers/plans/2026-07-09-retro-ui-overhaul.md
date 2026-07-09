# Retro 8-bit UI Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the Koperasi Merah Putih 2D UI to a cohesive 8-bit / pixel-art theme (Stardew-Valley-flavored: parchment panels, chunky wooden borders, hard pixel shadows) driven by a self-hosted pixel font and a single set of retro design tokens.

**Architecture:** All theming lives in one global stylesheet, `src/index.css`, via CSS custom properties (design tokens) declared on `:root`. Components keep their existing class names; we retheme the classes and pull the worst conflicting inline styles into new utility classes. No component logic or store code changes. The Three.js store *scene* (geometry/materials in `components/store3d/StoreScene.jsx`, `Furniture.jsx`, `StoreFloor.jsx`) is explicitly out of scope — only its HTML sidebar overlay (`TokoFurnitur.jsx` → `.three-sidebar`) is rethemed.

**Tech Stack:** React 19, Vite, plain CSS (no CSS framework, no preprocessor), self-hosted `@font-face` pixel font.

## Global Constraints

- **No new dependencies.** Theming is CSS-only; do not add npm packages.
- **Self-hosted font only.** The pixel font must live under `public/assets/fonts/` and load via `@font-face`. Do not rely on the Google Fonts `@import` (remove it). Font must be redistributable (OFL/CC0/public-domain); if RetroPix's license does not permit self-hosting, use the specified OFL fallback.
- **All user-facing copy stays Bahasa Indonesia.** This is a visual-only change; do not alter any text strings in `src/constants/uiStrings.js` or JSX.
- **Retro visual rules (apply everywhere):** border-radius `0` on all panels/buttons/cards/inputs; no `backdrop-filter: blur`; no soft/blurred `box-shadow` (use hard offset shadows like `4px 4px 0` with no blur radius); no smooth color `linear-gradient` fills on chrome (flat fills or the wood texture instead). Progress-bar fills may stay flat-colored.
- **Pixel crispness:** images use `image-rendering: pixelated`.
- **Item keys** are always `rice`, `cookingOil`, `lpgGas` — do not rename when touching markup.
- **Verification model:** This is CSS/visual work in a repo with **no test runner, linter, or formatter**. "Tests" in this plan mean: (a) `npm run build` completes with no errors, and (b) a scripted visual check — start `npm run dev`, open the named screen, and confirm the described look. There is no automated assertion framework; do not invent one.
- **Commit cadence:** one commit per task, message prefixed `style:`.

---

## File & Responsibility Map

- `src/index.css` — **the only stylesheet.** Holds `:root` tokens, `@font-face`, base element styles, every component class. All tasks except Task 1 (font download) edit this file.
- `public/assets/fonts/` — **created in Task 1.** Holds the self-hosted pixel font file(s).
- `public/assets/images/ui/wood_texture.png` — **renamed in Task 1** from the current `wood_texture.png.png` (double extension) so `.wooden-panel`'s existing `url('/assets/images/ui/wood_texture.png')` reference resolves.
- Component `.jsx` files — edited **only** to remove/replace conflicting inline styles by swapping them for classes (Tasks 6, 8, 9, 10). No logic changes. Files touched: `components/hud/PasarPasokan.jsx`, `components/hud/TopBar.jsx`, `components/dashboard/Dashboard.jsx`, and any modal whose inline styles fight the theme (identified in Task 10).

### Token vocabulary (defined in Task 1, used by all later tasks)

Later tasks reference these variable names — they are introduced in Task 1 Step 3 and must match exactly:

- Surfaces: `--paper` (parchment panel fill), `--paper-2` (raised inner card), `--wood-dark` (border/ink), `--wood-mid`, `--wood-light` (bevel highlight).
- Ink/text: `--ink` (primary text on paper), `--ink-soft` (muted text on paper), `--ink-inverse` (text on wood/dark).
- Accents (kept from current palette): `--accent-red #c42026`, `--accent-green #2f8b57`, `--accent-blue #315f8f`, `--accent-gold #d89b1d`, `--accent-orange #bd6b2f`.
- Retro primitives: `--pixel-border` (chunky border shorthand color = `--wood-dark`), `--pixel-shadow` (hard offset shadow), `--pixel-shadow-sm`, `--font-pixel` (the pixel font stack), `--focus-ring`.

---

### Task 1: Retro foundation — self-hosted pixel font, tokens, base styles, texture fix

**Files:**
- Create: `public/assets/fonts/` (directory + downloaded font file, e.g. `PixelFont.woff2` / `.ttf`)
- Rename: `public/assets/images/ui/wood_texture.png.png` → `public/assets/images/ui/wood_texture.png`
- Modify: `src/index.css:1-46` (the `@import`, `:root` block, and base `*`/`body`/`.app` rules)

**Interfaces:**
- Consumes: nothing (first task).
- Produces: the token names listed in "Token vocabulary" above, a `--font-pixel` family, and a working `.app`/`body` base. Every later task depends on these tokens existing.

- [ ] **Step 1: Source and download a redistributable pixel font**

Preferred: RetroPix, *only if* its license permits self-hosting/redistribution. If unclear or personal-use-only, use the guaranteed OFL fallback **Pixelify Sans** (SIL Open Font License, redistributable). Both render a clean Stardew-adjacent pixel look.

Fallback download (run from repo root; Git Bash):

```bash
mkdir -p public/assets/fonts
# Pixelify Sans (OFL) — self-host the static regular weight
curl -L -o public/assets/fonts/PixelFont.ttf \
  "https://github.com/google/fonts/raw/main/ofl/pixelifysans/PixelifySans%5Bwght%5D.ttf"
ls -la public/assets/fonts/
```

If you obtained a licensed RetroPix file instead, save it as `public/assets/fonts/PixelFont.ttf` (or `.woff2`) so the `@font-face` below is filename-stable regardless of which font won.

- [ ] **Step 2: Verify the font file exists and is non-empty**

Run: `ls -la public/assets/fonts/PixelFont.*`
Expected: a file of at least ~20 KB (not a 0-byte or HTML error page). If `curl` produced a tiny file, open it — a redirect/error page means the URL failed; re-fetch.

- [ ] **Step 3: Rename the wood texture to fix the broken `.wooden-panel` reference**

Run:
```bash
mv "public/assets/images/ui/wood_texture.png.png" "public/assets/images/ui/wood_texture.png"
ls public/assets/images/ui/
```
Expected: `wood_texture.png` present, no `.png.png`.

- [ ] **Step 4: Replace the top of `src/index.css` (font import + tokens + base)**

Replace the current `src/index.css:1-46` (from the `@import url(...VT323...)` line through the end of the `.app { ... }` rule) with:

```css
/* ── Self-hosted pixel font ─────────────────────────────────────── */
@font-face {
  font-family: 'PixelFont';
  src: url('/assets/fonts/PixelFont.ttf') format('truetype');
  font-weight: 100 900;
  font-display: swap;
}

:root {
  /* Surfaces */
  --paper: #f4e4bc;
  --paper-2: #fff6e0;
  --wood-dark: #3a2412;
  --wood-mid: #7a4a1e;
  --wood-light: #b9843f;

  /* Ink / text */
  --ink: #2b1c0c;
  --ink-soft: #6b5334;
  --ink-inverse: #fff6e0;

  /* Accents (retained hues) */
  --accent-red: #c42026;
  --accent-green: #2f8b57;
  --accent-blue: #315f8f;
  --accent-gold: #d89b1d;
  --accent-orange: #bd6b2f;

  /* Retro primitives */
  --pixel-border-w: 4px;
  --pixel-shadow: 5px 5px 0 rgba(43, 28, 12, 0.85);
  --pixel-shadow-sm: 3px 3px 0 rgba(43, 28, 12, 0.85);
  --font-pixel: 'PixelFont', 'VT323', monospace;
  --focus-ring: 0 0 0 3px var(--accent-gold);

  /* Back-compat aliases so untouched rules keep working until rethemed.
     Later tasks migrate rules off these; remove aliases in Task 10. */
  --bg-card: var(--paper);
  --bg-card-hover: var(--paper-2);
  --text-primary: var(--ink);
  --text-secondary: var(--ink-soft);
  --text-inverse: var(--ink-inverse);
  --text-on-card: var(--ink);
  --muted-on-card: var(--ink-soft);
  --card-border: var(--wood-dark);
  --border: rgba(58, 36, 18, 0.35);
  --accent-yellow: var(--accent-gold);
  --font-sans: var(--font-pixel);
  --shadow-lg: var(--pixel-shadow);
  --bg-primary: #241a10;
  --bg-secondary: #3a2a18;
  --bg-panel: #2c2013;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

img {
  image-rendering: pixelated;
}

body {
  font-family: var(--font-pixel);
  background-color: var(--bg-primary);
  color: var(--ink);
  overflow: hidden;
  -webkit-font-smoothing: none;
  font-smooth: never;
}

.app {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #241a10;
}
```

- [ ] **Step 5: Build to verify nothing broke**

Run: `npm run build`
Expected: build succeeds, no CSS/import errors. (Vite copies `public/` verbatim; the font/texture are served at their `/assets/...` paths.)

- [ ] **Step 6: Visual check — font actually loads**

Run: `npm run dev`, open the app, and confirm the UI renders in the new pixel font (not the browser default serif/sans). In DevTools Network tab, confirm `PixelFont.ttf` loads `200` (not `404`). Confirm no console 404 for `wood_texture.png`.

- [ ] **Step 7: Commit**

```bash
git add public/assets/fonts src/index.css public/assets/images/ui
git commit -m "style: add self-hosted pixel font, retro tokens, fix wood texture path"
```

---

### Task 2: Retro core primitives — panels, buttons, inputs, modal shell

**Files:**
- Modify: `src/index.css` — rules `.glass-card` (48-60), `.wooden-panel` (62-69), `.btn` + variants (85-151), `.modal-overlay`/`.modal-content`/`.modal-header`/`.modal-close` (153-203), `.form-input` (1451-1467), scrollbar (1706-1719).

**Interfaces:**
- Consumes: Task 1 tokens.
- Produces: retro `.glass-card`, `.wooden-panel`, `.btn`/`.btn-primary`/`.btn-success`/`.btn-danger`/`.btn-secondary`/`.btn-upgrade`, `.modal-*`, `.form-input`. Every screen task below relies on these.

- [ ] **Step 1: Retheme panels — replace `.glass-card` and `.wooden-panel` (index.css:48-69)**

```css
.glass-card {
  background: var(--paper);
  color: var(--ink);
  border: var(--pixel-border-w) solid var(--wood-dark);
  border-radius: 0;
  padding: 16px;
  box-shadow: var(--pixel-shadow);
  transition: none;
}

.glass-card:hover {
  background: var(--paper);
}

.wooden-panel {
  background: url('/assets/images/ui/wood_texture.png') repeat;
  background-size: 64px;
  border: var(--pixel-border-w) solid var(--wood-dark);
  box-shadow:
    inset 3px 3px 0 rgba(255, 246, 224, 0.18),
    inset -3px -3px 0 rgba(0, 0, 0, 0.45),
    var(--pixel-shadow);
  color: var(--ink-inverse);
  border-radius: 0;
}
```

- [ ] **Step 2: Retheme buttons — replace `.btn` through `.btn:disabled` (index.css:85-145)**

```css
.btn {
  font-family: var(--font-pixel);
  font-weight: 400;
  font-size: 20px;
  padding: 8px 16px;
  border-radius: 0;
  border: 3px solid var(--wood-dark);
  box-shadow: var(--pixel-shadow-sm);
  cursor: pointer;
  transition: transform 0.06s steps(2), box-shadow 0.06s steps(2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  color: var(--ink);
  background: var(--paper-2);
  text-shadow: 1px 1px 0 rgba(255, 246, 224, 0.35);
}

.btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 rgba(43, 28, 12, 0.85);
}

.btn:active {
  transform: translate(3px, 3px);
  box-shadow: 0 0 0 rgba(43, 28, 12, 0.85);
}

.btn-primary { background: var(--accent-red); color: #fff; text-shadow: 1px 1px 0 rgba(0,0,0,0.4); }
.btn-primary:hover { background: #d63a3f; }

.btn-success { background: var(--accent-green); color: #fff; text-shadow: 1px 1px 0 rgba(0,0,0,0.4); }
.btn-success:hover { background: #37a267; }

.btn-danger { background: #e9d3c2; color: var(--accent-red); border-color: var(--accent-red); }
.btn-danger:hover { background: #f0c9c0; }

.btn-secondary { background: var(--paper-2); color: var(--ink); }
.btn-secondary:hover { background: #fffbef; }

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: var(--pixel-shadow-sm) !important;
}
```

- [ ] **Step 3: Retheme modal shell — replace `.modal-overlay` and `.modal-header`/`.modal-close` (index.css:153-165, 177-203)**

Replace `.modal-overlay` (remove blur):

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(36, 26, 16, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s steps(3);
}
```

Replace `.modal-header` + `.modal-header h2` + `.modal-close` + `.modal-close:hover` (index.css:177-203):

```css
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 3px solid var(--wood-dark);
  padding-bottom: 12px;
  margin-bottom: 16px;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 400;
  color: var(--ink);
}

.modal-close {
  background: var(--accent-red);
  border: 3px solid var(--wood-dark);
  color: #fff;
  width: 34px;
  height: 34px;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  box-shadow: var(--pixel-shadow-sm);
}

.modal-close:hover {
  background: #d63a3f;
}
```

- [ ] **Step 4: Retheme inputs and scrollbar — replace `.form-input`/`:focus` (index.css:1451-1467) and scrollbar (1706-1719)**

```css
.form-input {
  background: var(--paper-2);
  border: 3px solid var(--wood-dark);
  color: var(--ink);
  padding: 8px 12px;
  border-radius: 0;
  font-family: var(--font-pixel);
  font-size: 16px;
  width: 100%;
  outline: none;
  transition: none;
}

.form-input:focus {
  border-color: var(--accent-gold);
}

::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: var(--paper); }
::-webkit-scrollbar-thumb { background: var(--wood-mid); border: 2px solid var(--wood-dark); border-radius: 0; }
::-webkit-scrollbar-thumb:hover { background: var(--wood-light); }
```

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: success, no errors.

- [ ] **Step 6: Visual check — primitives**

Run `npm run dev`. On the dashboard, open the **Pasar** modal (right sidebar). Confirm: parchment panel with thick brown border and hard drop shadow (no blur, no rounded corners); the "Beli" buttons show a hard shadow that collapses on press; the close button is a red pixel square; the number inputs have chunky borders.

- [ ] **Step 7: Commit**

```bash
git add src/index.css
git commit -m "style: retro pixel panels, buttons, inputs, modal shell"
```

---

### Task 3: Dashboard chrome — top bar, stat pills, right sidebar, event banners

**Files:**
- Modify: `src/index.css` — `.top-bar` area (234-299), `.right-sidebar`/`.sidebar-btn` (301-339), `.event-banners`/`.event-banner*` (810-849), `.dashboard` (222-232).
- Modify: `src/components/hud/TopBar.jsx:38` (one inline style on the right-side wrapper — optional class extraction).

**Interfaces:**
- Consumes: Task 1 tokens, Task 2 primitives.
- Produces: retro `.stat-pill`, `.sidebar-btn`, `.event-banner` looks. No new class names other components depend on.

- [ ] **Step 1: Retheme stat pills — replace `.stat-pill` and its variants (index.css:255-299)**

```css
.stat-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 42px;
  padding: 8px 14px;
  border-radius: 0;
  font-size: 20px;
  font-weight: 400;
  background: var(--paper);
  border: 3px solid var(--wood-dark);
  box-shadow: var(--pixel-shadow-sm);
  color: var(--ink);
}

.stat-pill.money-pill {
  min-width: 170px;
  justify-content: center;
  font-size: 16px;
  background: #ffe9a8;
  border-color: var(--wood-dark);
  color: #6b4a0d;
}

.stat-button {
  font-family: var(--font-pixel);
  cursor: pointer;
}

.stat-pill.happiness-pill { transition: none; }
.happiness-green { color: var(--accent-green); }
.happiness-yellow { color: var(--accent-gold); }
.happiness-red { color: var(--accent-red); }
```

- [ ] **Step 2: Retheme right sidebar buttons — replace `.sidebar-btn`/`:hover` (index.css:312-339)**

```css
.sidebar-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 86px;
  min-height: 76px;
  border-radius: 0;
  font-size: 12px;
  font-weight: 400;
  gap: 6px;
  border: 3px solid var(--wood-dark);
  cursor: pointer;
  transition: transform 0.06s steps(2);
  background: var(--paper);
  color: var(--ink);
  box-shadow: var(--pixel-shadow-sm);
}

.sidebar-btn:hover {
  background: var(--paper-2);
  transform: translate(-1px, -1px);
}

.sidebar-btn span.emoji { font-size: 24px; }
```

- [ ] **Step 3: Retheme event banners — replace `.event-banner*` (index.css:825-849)**

```css
.event-banner {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 0;
  font-size: 14px;
  font-weight: 400;
  border: 3px solid var(--wood-dark);
  box-shadow: var(--pixel-shadow-sm);
  animation: slideUp 0.25s steps(4);
}

.event-banner.danger { background: #7a1f1f; color: #ffe3e3; border-left: 8px solid var(--accent-red); }
.event-banner.warning { background: #7a4a12; color: #ffe9c7; border-left: 8px solid var(--accent-orange); }
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 5: Visual check — dashboard chrome**

Run `npm run dev`. On the dashboard confirm: stat pills are parchment pixel boxes with hard shadows; money pill is a gold pixel box; the three right-side nav buttons (`btn_museum/pasar/harga` PNGs) sit above/among crisp pixel sidebar buttons; trigger or inspect an event banner (or temporarily verify via DevTools) that it renders as a bordered pixel banner with a thick colored left edge.

- [ ] **Step 6: Commit**

```bash
git add src/index.css
git commit -m "style: retro dashboard top bar, stat pills, sidebar, event banners"
```

---

### Task 4: Dashboard bottom bar — cards, quick actions, calendar pill, end-day

**Files:**
- Modify: `src/index.css` — `.bottom-bar` group (660-808): `.bottom-bar`, `.bottom-section-title`, `.bottom-card`/`:hover`, `.bottom-card-avatar`, `.bottom-card-name`, `.bottom-card-subtitle`, `.empty-state`, `.quick-actions`, `.calendar-pill`, `.calendar-*`, `.btn-endday`, `.endday-subtitle`, `.date-badge` (642-658).

**Interfaces:**
- Consumes: Task 1 tokens, Task 2 primitives.
- Produces: retro bottom-bar visuals. No cross-task class contracts.

- [ ] **Step 1: Retheme bottom cards — replace `.bottom-card`/`:hover`, `.bottom-card-avatar`, name/subtitle (index.css:697-741)**

```css
.bottom-card {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 0;
  background: var(--paper-2);
  border: 3px solid var(--wood-dark);
  cursor: pointer;
  transition: transform 0.06s steps(2);
  min-height: 56px;
  color: var(--ink);
  font-family: var(--font-pixel);
  text-align: left;
  box-shadow: var(--pixel-shadow-sm);
}

.bottom-card:hover { background: #fffbef; transform: translate(-1px, -1px); }

.bottom-card-avatar {
  width: 34px;
  height: 34px;
  border-radius: 0;
  border: 2px solid var(--wood-dark);
  object-fit: cover;
}

.bottom-card-name { font-size: 15px; font-weight: 400; color: var(--ink); }
.bottom-card-subtitle { font-size: 12px; color: var(--ink-soft); }
```

- [ ] **Step 2: Retheme calendar pill + quick actions — replace `.calendar-month/day/year` (index.css:773-791) and ensure `.quick-actions .sidebar-btn` keeps a border**

```css
.calendar-month { font-size: 11px; font-weight: 400; text-transform: uppercase; color: var(--accent-red); }
.calendar-day { font-size: 28px; font-weight: 400; color: var(--ink); line-height: 1; margin: 2px 0; }
.calendar-year { font-size: 10px; color: var(--ink-soft); }
```

Replace `.quick-actions .sidebar-btn` (index.css:757-761) so it keeps the pixel shadow:

```css
.quick-actions .sidebar-btn {
  width: 100%;
  min-height: 88px;
  box-shadow: var(--pixel-shadow-sm);
}
```

- [ ] **Step 3: Retheme end-day button + date badge — replace `.endday-subtitle` (804-808) and `.date-badge`/`span` (642-658)**

```css
.endday-subtitle { font-size: 12px; font-weight: 400; opacity: 0.85; }

.date-badge {
  position: fixed;
  bottom: 154px;
  left: 376px;
  z-index: 90;
  padding: 8px 12px;
  border-radius: 0;
  background: var(--wood-dark);
  border: 3px solid #1c1108;
  font-size: 14px;
  font-weight: 400;
  color: var(--ink-inverse);
  box-shadow: var(--pixel-shadow-sm);
}

.date-badge span { color: var(--ink-inverse) !important; }
```

- [ ] **Step 4: Retheme empty-state + section title colors — replace `.bottom-section-title` (681-687) and `.empty-state` (743-749)**

```css
.bottom-section-title {
  font-size: 13px;
  font-weight: 400;
  text-transform: uppercase;
  color: var(--ink-inverse);
  letter-spacing: 0.5px;
  text-shadow: 2px 2px 0 rgba(0,0,0,0.5);
}

.empty-state {
  display: flex;
  align-items: center;
  min-height: 56px;
  font-size: 13px;
  color: var(--ink-soft);
}
```

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 6: Visual check — bottom bar**

Run `npm run dev`. Confirm the bottom bar's loan/member cards are parchment pixel boxes with square avatars and hard shadows; the calendar pill and "Akhiri Hari" button read as chunky pixel controls; section titles ("PINJAMAN", "PENDAFTARAN ANGGOTA") are legible over the background.

- [ ] **Step 7: Commit**

```bash
git add src/index.css
git commit -m "style: retro dashboard bottom bar, cards, calendar, end-day"
```

---

### Task 5: Dashboard side panels — chapter progress, advisory memo, store entry

**Files:**
- Modify: `src/index.css` — `.chapter-progress` group (419-531), `.advisory-memo` group (400-417, 533-572), `.center-building-area`/`.store-entry-*` (341-398), `.building-*`/`.btn-masuk` (574-640).

**Interfaces:**
- Consumes: Task 1 tokens.
- Produces: retro looks for `ChapterProgress.jsx`, `AdvisoryMemo.jsx`, and the store-entry panel. No cross-task contracts.

- [ ] **Step 1: Retheme chapter progress — replace `.chapter-progress` (419-431), `.chapter-goal`/`.chapter-next` (491-531), `.chapter-main-progress` (471-484)**

```css
.chapter-progress {
  position: fixed;
  left: 16px;
  top: 86px;
  z-index: 91;
  width: min(340px, calc(100vw - 160px));
  padding: 12px;
  border-radius: 0;
  background: var(--paper);
  border: 4px solid var(--wood-dark);
  box-shadow: var(--pixel-shadow);
  color: var(--ink);
}

.chapter-main-progress {
  height: 12px;
  margin: 8px 0;
  overflow: hidden;
  border-radius: 0;
  background: #d8c39a;
  border: 2px solid var(--wood-dark);
}

.chapter-main-progress span {
  display: block;
  height: 100%;
  border-radius: 0;
  background: var(--accent-green);
}

.chapter-goal,
.chapter-next {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 0;
  background: var(--paper-2);
  border: 2px solid var(--wood-dark);
  font-size: 13px;
}

.chapter-goal span, .chapter-next span { color: var(--ink-soft); font-weight: 400; }
.chapter-goal strong, .chapter-next strong { color: var(--ink); font-weight: 400; text-align: right; }
.chapter-goal.is-complete { background: #dcefdf; border-color: var(--accent-green); }
.chapter-goal.is-complete strong::before { content: '✓ '; color: var(--accent-green); }
.chapter-next { margin-top: 7px; background: #dfeaf4; border-color: var(--accent-blue); }
```

Also replace the round avatar border in `.chapter-heading img` (index.css:441-448): change `border-radius: 999px;` → `border-radius: 0;` and `border: 2px solid #d89b1d;` → `border: 3px solid var(--wood-dark);`.

- [ ] **Step 2: Retheme advisory memo — replace `.advisory-memo` (400-417) and `.chapter-main-progress` bar analog if present**

```css
.advisory-memo {
  position: fixed;
  left: 16px;
  top: 374px;
  z-index: 90;
  width: min(320px, calc(100vw - 160px));
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border-radius: 0;
  background: var(--paper);
  border: 4px solid var(--wood-dark);
  box-shadow: var(--pixel-shadow);
  color: var(--ink);
  max-height: 164px;
  overflow: auto;
}
```

- [ ] **Step 3: Retheme store-entry panel + button — replace `.store-entry-panel` (353-361), `.store-entry-metrics span` (380-392), `.building-graphic` (574-587)**

```css
.store-entry-panel {
  width: min(360px, calc(100vw - 160px));
  padding: 20px;
  border: 4px solid var(--wood-dark);
  border-radius: 0;
  background: url('/assets/images/ui/wood_texture.png') repeat;
  background-size: 64px;
  box-shadow:
    inset 3px 3px 0 rgba(255,246,224,0.18),
    inset -3px -3px 0 rgba(0,0,0,0.45),
    var(--pixel-shadow);
  text-align: center;
}

.store-entry-metrics span {
  display: flex;
  min-height: 48px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 0;
  background: rgba(255, 246, 224, 0.12);
  border: 2px solid rgba(28,17,8,0.5);
  color: var(--ink-inverse);
  font-size: 12px;
  font-weight: 400;
}
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 5: Visual check — side panels**

Run `npm run dev`. Confirm the chapter-progress panel (top-left) and advisory memo below it are parchment pixel frames; the goal rows are square-bordered; progress bar is a flat green fill in a bordered track; the advisor avatar is a square, not a circle. Confirm the center "Masuk Toko" panel reads as a wooden signboard.

- [ ] **Step 6: Commit**

```bash
git add src/index.css
git commit -m "style: retro chapter progress, advisory memo, store entry panel"
```

---

### Task 6: Market & price modals — tabs, tables, kill conflicting inline styles

**Files:**
- Modify: `src/index.css` — `.data-table` group (1065-1086).
- Modify: `src/components/hud/PasarPasokan.jsx` — inline styles at lines 76, 83-98 (tabs), 101-107 (warning box), 111 (error box), 172-184 (footer).
- Modify: `src/components/hud/KontrolHarga.jsx` — inspect and replace any inline `borderRadius`, `rgba(15,23,42,...)`, blur to match (read file first).

**Interfaces:**
- Consumes: Task 2 primitives (`.btn`, `.modal-*`), Task 1 tokens.
- Produces: new utility classes `.tab-row`, `.tab-btn`/`.tab-btn.active`, `.info-note`/`.info-note.warn`/`.info-note.good`, `.modal-footer-row` used by market/price modals (and reusable by other modals in Task 10).

- [ ] **Step 1: Add reusable modal utility classes to `src/index.css`**

Append near the `.data-table` rules:

```css
/* Reusable modal content utilities (retro) */
.tab-row { display: flex; gap: 8px; margin-bottom: 16px; }
.tab-btn {
  flex: 1;
  font-family: var(--font-pixel);
  font-size: 18px;
  padding: 8px 12px;
  border: 3px solid var(--wood-dark);
  background: var(--paper-2);
  color: var(--ink);
  cursor: pointer;
  box-shadow: var(--pixel-shadow-sm);
}
.tab-btn.active { color: #fff; text-shadow: 1px 1px 0 rgba(0,0,0,0.4); }
.tab-btn.active.tab-pt { background: var(--accent-blue); }
.tab-btn.active.tab-umkm { background: var(--accent-orange); }

.info-note {
  padding: 10px 12px;
  border: 3px solid var(--wood-dark);
  background: var(--paper-2);
  font-size: 13px;
  color: var(--ink);
  margin-bottom: 16px;
}
.info-note.warn { border-left: 8px solid var(--accent-red); }
.info-note.good { border-left: 8px solid var(--accent-green); }
.info-note.error { background: #f3d3d0; border-left: 8px solid var(--accent-red); color: #7a1f1f; }

.modal-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  border-top: 3px solid var(--wood-dark);
  padding-top: 16px;
}
```

- [ ] **Step 2: Retheme `.data-table` — replace index.css:1065-1086**

```css
.data-table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 14px; }
.data-table th {
  background: var(--wood-mid);
  color: var(--ink-inverse);
  padding: 10px;
  text-align: left;
  font-weight: 400;
  border: 2px solid var(--wood-dark);
}
.data-table td {
  padding: 10px;
  border: 2px solid var(--wood-dark);
  background: var(--paper-2);
  vertical-align: middle;
}
```

- [ ] **Step 3: Replace PasarPasokan tab buttons (PasarPasokan.jsx:83-98)**

Replace the tab wrapper `<div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>` and its two buttons with:

```jsx
        {/* Supplier Tabs */}
        <div className="tab-row">
          <button
            className={`tab-btn tab-pt ${activeTab === 'PT' ? 'active' : ''}`}
            onClick={() => { setActiveTab('PT'); setErrorMsg(''); }}
          >
            🏢 {UI.PEMASOK_PT}
          </button>
          <button
            className={`tab-btn tab-umkm ${activeTab === 'UMKM' ? 'active' : ''}`}
            onClick={() => { setActiveTab('UMKM'); setErrorMsg(''); }}
          >
            🌾 {UI.PEMASOK_UMKM}
          </button>
        </div>
```

- [ ] **Step 4: Replace PasarPasokan warning + error boxes (PasarPasokan.jsx:100-114)**

```jsx
        {/* Warning about happiness */}
        <div className={`info-note ${isPT ? 'warn' : 'good'}`}>
          {isPT ? (
            <span>⚠️ Pembelian dari PT menghemat biaya tapi menurunkan Kebahagiaan warga (-2% per transaksi).</span>
          ) : (
            <span>☘️ Pembelian dari UMKM Desa meningkatkan Kebahagiaan warga (+2% per transaksi) & mendukung ekonomi lokal!</span>
          )}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="info-note error">
            {errorMsg}
          </div>
        )}
```

- [ ] **Step 5: Replace PasarPasokan footer + card wrapper (PasarPasokan.jsx:76, 172)**

At line 76 remove the inline `style={{ maxWidth: '640px' }}` if it conflicts — keep width by adding a class: change to `className="modal-content glass-card modal-wide"` and add to index.css:

```css
.modal-wide { max-width: 660px; }
```

Replace the footer `<div style={{ display: 'flex', justifyContent: 'space-between', ... }}>` (line 172) opening tag with `<div className="modal-footer-row">` and delete the inline color/size styles on its inner `<span>`s, letting them inherit (they remain legible on parchment). Keep the `formatRupiah(...)` expressions unchanged.

- [ ] **Step 6: Retheme KontrolHarga inline styles**

Read `src/components/hud/KontrolHarga.jsx`. For every inline style using `borderRadius`, a `rgba(15,23,42,...)`/slate color, or `backdrop`/blur, either remove it or swap to the utility classes from Step 1 (`.info-note`, `.modal-footer-row`) following the same pattern as PasarPasokan. Do not change any logic, state, or text.

- [ ] **Step 7: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 8: Visual check — market & price**

Run `npm run dev`. Open **Pasar**: tabs are chunky pixel buttons (active PT=blue, UMKM=orange); the happiness note is a bordered parchment box with a thick colored left edge; the table has wooden headers and bordered parchment cells; buying with 0 qty shows a red-edged error note. Open **Harga**: confirm no rounded/blur leftovers.

- [ ] **Step 9: Commit**

```bash
git add src/index.css src/components/hud/PasarPasokan.jsx src/components/hud/KontrolHarga.jsx
git commit -m "style: retro market & price modals, reusable modal utilities"
```

---

### Task 7: Planner calendar modal (PanelKalender)

**Files:**
- Modify: `src/index.css` — planner group (1088-1391): `.planner-modal`, `.planner-summary`, progress/target bars, `.planner-chapter*`, `.planner-day*`, dots, `.planner-memo`, `.planner-event*`, `.planner-legend*`.

**Interfaces:**
- Consumes: Task 1 tokens.
- Produces: retro planner visuals. No cross-task contracts.

- [ ] **Step 1: Square-ify all planner surfaces — replace border-radius and soft shadows**

In the planner block (index.css:1088-1391), apply these changes (each rule keeps its layout; only the retro properties change):
- `.planner-modal`: `border-radius: 0;` `border: 4px solid var(--wood-dark);` `background: var(--paper);` `box-shadow: var(--pixel-shadow);`
- `.planner-progress, .planner-target-bar`: `border-radius: 0;` `background: #d8c39a;` add `border: 2px solid var(--wood-dark);` and set their `span` fill `border-radius: 0; background: var(--accent-green);`
- `.planner-chapter`, `.planner-target-card`, `.planner-day`, `.planner-memo`, `.planner-event`, `.planner-empty`: `border-radius: 0;` `border: 2px solid var(--wood-dark);` `background: var(--paper-2);`
- `.planner-chapter.is-active`, `.planner-day.is-today`: `border-color: var(--accent-blue); background: #dfeaf4;`
- `.planner-chapter.is-complete`, `.planner-day.has-shu`: `border-color: var(--accent-green); background: #dcefdf;`
- `.planner-day.has-harvest`: `background: #f6e2c0;`
- `.planner-day.has-crisis`: `background: #f3d3d0;`
- Dots `.dot-harvest/.dot-crisis/.dot-shu` and `.planner-legend i`: `border-radius: 0;` (keep colors).

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 3: Visual check — planner**

Run `npm run dev`, open the calendar (bottom-bar calendar pill → **kalender** modal). Confirm the month grid, chapter cards, target cards, memo, and legend are all square pixel tiles with wooden borders; event day-tiles use flat retro fills; legend dots are little squares.

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "style: retro planner calendar modal"
```

---

### Task 8: Story overlays & notifications

**Files:**
- Modify: `src/index.css` — story-intro group (851-942), story-moment group (944-1020), notifications (1022-1063).
- (No JSX change needed — `StoryIntro.jsx` / `StoryMoment.jsx` use classes.)

**Interfaces:**
- Consumes: Task 1 tokens, Task 2 primitives.
- Produces: retro story dialog + notification looks.

- [ ] **Step 1: Retheme story portraits & dialog — replace `.story-art img` (881-888), `.story-village-mark` (890-903), `.story-dialog` (905-912), `.story-speaker` (914-923), `.story-moment-portrait img/span` (970-988), `.story-moment-body` (990-996)**

Key changes (keep layout/positions, change retro props):
- `.story-art img`, `.story-moment-portrait img`, `.story-moment-portrait span`, `.story-village-mark`: `border-radius: 0;` change gold ring `border: 8px solid #f6c464;`/`5px solid #f2c15f;` → `border: 4px solid var(--wood-dark);` and set a hard shadow `box-shadow: var(--pixel-shadow);` (replace the soft `0 24px 60px` shadows).
- `.story-dialog`, `.story-moment-body`: `border-radius: 0;` `background: var(--paper);` `border: 4px solid var(--wood-dark);` `box-shadow: var(--pixel-shadow);`
- `.story-speaker`: `border-radius: 0;` `background: var(--accent-red);` `border: 3px solid var(--wood-dark);` `color: #fff;`
- `.story-moment.warning/.danger/.success .story-moment-body`: change the `border-left: 5px solid ...` → `border-left: 8px solid ...` (keep the accent colors).

- [ ] **Step 2: Retheme notifications — replace `.notification-toast` (1034-1051) and `.notification-close` (1053-1063)**

```css
.notification-toast {
  pointer-events: auto;
  min-width: 260px;
  max-width: 340px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
  border-radius: 0;
  background: var(--paper);
  color: var(--ink);
  border: 3px solid var(--wood-dark);
  border-left: 8px solid var(--accent-blue);
  box-shadow: var(--pixel-shadow-sm);
  animation: slideUp 0.2s steps(3);
}

.notification-close {
  background: none;
  border: none;
  color: var(--ink-soft);
  cursor: pointer;
  font-size: 18px;
}
.notification-close:hover { color: var(--ink); }
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 4: Visual check — story & toasts**

Run `npm run dev`. The story intro shows on first load — confirm portrait is a square wooden-framed image, dialog is a parchment box, speaker chip is a red pixel tag. Advance the game to trigger a notification (e.g. buy furniture / accept a member) and confirm the toast is a parchment pixel card with a thick colored left edge.

- [ ] **Step 5: Commit**

```bash
git add src/index.css
git commit -m "style: retro story overlays and notifications"
```

---

### Task 9: 3D store sidebar overlay (TokoFurnitur)

**Files:**
- Modify: `src/index.css` — three-view group (1469-1704): `.three-container`, `.tycoon-panel`, `.shop-header`, `.shop-money`, `.placement-card`/`.selected-card`/`.upgrade-card`/`.furniture-card`, `.swatch`/`.swatch.active`, `.move-pad`, `.btn-upgrade`.
- Modify: `src/components/store3d/TokoFurnitur.jsx` — only if inline styles conflict (the description spans are inline at lines 153-167; leave logic, ensure legibility on wood panel).

**Interfaces:**
- Consumes: Task 1 tokens, Task 2 primitives. Note `.three-sidebar` already carries `.wooden-panel` (retthemed in Task 2), so the sidebar frame is wood.
- Produces: retro furniture-shop cards & swatches.

- [ ] **Step 1: Retheme shop cards — replace `.placement-card,.selected-card,.upgrade-card,.furniture-card` (1533-1546) and the header/money (1499-1531)**

```css
.placement-card,
.selected-card,
.upgrade-card,
.furniture-card {
  border-radius: 0;
  border: 3px solid var(--wood-dark);
  background: var(--paper-2);
  padding: 12px;
}
.placement-card { border-color: var(--accent-green); background: #dcefdf; }
.selected-card { border-color: var(--accent-blue); background: #dfeaf4; }
.upgrade-card { border-color: var(--accent-gold); background: #ffe9a8; }

.shop-header { border-bottom: 3px solid var(--wood-dark); }
.shop-money {
  flex: 0 0 auto;
  padding: 8px 10px;
  border-radius: 0;
  border: 3px solid var(--wood-dark);
  background: #ffe9a8;
  color: #6b4a0d;
  font-size: 14px;
  font-weight: 400;
}
```

Note: `.tycoon-panel` (1489-1497) is used by non-wood sidebars — set `border-radius: 0; border: 4px solid var(--wood-dark); background: var(--paper); box-shadow: var(--pixel-shadow);`. `.shop-header h2`, `.panel-kicker` keep their text but inherit the pixel font; ensure their color reads on wood: since `.three-sidebar.wooden-panel` sets `color: var(--ink-inverse)`, override inside `.shop-header h2 { color: var(--ink-inverse); }` and `.panel-kicker { color: #e9d3b0; }`.

- [ ] **Step 2: Retheme color swatches — replace `.swatch`/`.swatch.active` (1587-1598)**

```css
.swatch {
  width: 30px;
  height: 30px;
  border-radius: 0;
  border: 3px solid var(--wood-dark);
  cursor: pointer;
}
.swatch.active {
  border-color: var(--accent-gold);
  box-shadow: 0 0 0 3px var(--accent-gold);
}
```

- [ ] **Step 3: Retheme upgrade button — replace `.btn-upgrade`/`:hover` (1681-1688)**

```css
.btn-upgrade { background: var(--accent-gold); color: var(--ink); text-shadow: 1px 1px 0 rgba(255,246,224,0.4); }
.btn-upgrade:hover { background: #e8ad2e; }
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 5: Visual check — store sidebar**

Run `npm run dev`, click "Masuk Toko" to enter the 3D view. Confirm the right sidebar is a wooden panel with parchment furniture cards, square color swatches (active = gold ring), and pixel buttons ("Beli & Pasang", "Upgrade", "Kembali"). The 3D scene itself is unchanged (expected).

- [ ] **Step 6: Commit**

```bash
git add src/index.css src/components/store3d/TokoFurnitur.jsx
git commit -m "style: retro furniture-shop sidebar"
```

---

### Task 10: Final sweep — remaining modals, inline-style cleanup, remove aliases

**Files:**
- Modify: `src/components/hud/LaporanHarian.jsx`, `src/components/hud/BagiHasil.jsx`, `src/components/hud/PanelAnggota.jsx`, `src/components/hud/PanelPinjaman.jsx`, `src/components/hud/PanelMuseum.jsx`, `src/components/dashboard/Dashboard.jsx` (game-over modal inline styles, lines 169-210).
- Modify: `src/index.css` — remove the temporary back-compat alias block from Task 1 once nothing depends on it; retheme any museum-specific classes discovered.

**Interfaces:**
- Consumes: all prior tasks' classes/tokens.
- Produces: a fully consistent retro theme with no stray rounded/blur/gradient/soft-shadow.

- [ ] **Step 1: Inventory remaining offenders**

Run:
```bash
grep -rn "borderRadius\|border-radius\|backdrop\|rgba(15,\|rgba(30, 41\|linear-gradient\|box-shadow: 0" src/components src/index.css
```
Expected: a list of every remaining non-retro spot. Work through each in the steps below; the grep is your checklist.

- [ ] **Step 2: Retheme each remaining modal's inline styles**

For each of `LaporanHarian.jsx`, `BagiHasil.jsx`, `PanelAnggota.jsx`, `PanelPinjaman.jsx`, `PanelMuseum.jsx`: read the file, and for inline styles that set `borderRadius`, slate `rgba(15,23,42,...)`/`rgba(30,41,59,...)` backgrounds, `backdrop-filter`, `linear-gradient`, or blurred `box-shadow`, replace with the retro utilities (`.info-note`, `.modal-footer-row`, `.glass-card`) or remove them so the class styling shows through. Keep all logic, state, `formatRupiah`, and Bahasa text unchanged. Museum images: ensure `<img>` picks up `image-rendering: pixelated` (global from Task 1 — no per-file change needed) and any rounded frames become `border-radius: 0` with `border: 3px solid var(--wood-dark)`.

- [ ] **Step 3: Retheme the game-over modal (Dashboard.jsx:169-210)**

Replace inline `borderRadius`/soft-shadow/gradient styles on the game-over overlay and inner stat card with retro equivalents: overlay `background: rgba(36,26,16,0.95)`; inner `.glass-card` stays (already retro); the inner stats box `style={{ background: 'rgba(15,23,42,0.4)', ... }}` → `style={{ background: 'var(--paper-2)', border: '3px solid var(--wood-dark)', padding: '16px', marginBottom: '24px', textAlign: 'left' }}`. Keep the win/lose color logic (`var(--accent-green)` / `var(--accent-red)`) and all `useGameStore.getState()` reads unchanged.

- [ ] **Step 4: Remove the back-compat alias block**

Re-run the Task 1 alias check — for each alias var (`--bg-card`, `--text-primary`, `--card-border`, `--border`, `--accent-yellow`, `--font-sans`, `--shadow-lg`, `--bg-secondary`, etc.), confirm whether any rule still uses it:

```bash
grep -n "var(--accent-yellow)\|var(--card-border)\|var(--shadow-lg)\|var(--text-on-card)\|var(--muted-on-card)\|var(--bg-secondary)\|var(--font-sans)\|var(--border)" src/index.css
```

If still referenced, **leave the aliases** (they are harmless and correct — they point at real tokens). If you have time and want cleanliness, replace remaining references with the canonical token (`--accent-yellow`→`--accent-gold`, `--card-border`→`--wood-dark`, `--shadow-lg`→`--pixel-shadow`, `--text-on-card`/`--muted-on-card`→`--ink`/`--ink-soft`, `--font-sans`→`--font-pixel`, `--border`→a `2px solid var(--wood-dark)` where used as a border) and then delete the alias block. Otherwise keep aliases and skip deletion. Do not leave any `var(--x)` pointing at a now-undefined variable.

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: success, no errors.

- [ ] **Step 6: Full visual sweep**

Run `npm run dev` and open every screen in turn, confirming consistent parchment/wood pixel styling with square corners, hard shadows, and the pixel font, and no blur/rounded/gradient leftovers:
1. Dashboard (chrome, bottom bar, side panels)
2. Pasar, Harga modals
3. Kalender (planner) modal
4. Pinjaman/Anggota list + detail modals
5. Laporan Harian (end a day) and Bagi Hasil (reach month-end) modals
6. Museum modal
7. Story intro + a story moment + a notification toast
8. 3D store view sidebar
9. Game-over modal (optional: force via a losing state)

Re-run the Step 1 grep; expected: only intentional retro shadows (`0 0 0`) and accent gradients on progress bars remain, if any.

- [ ] **Step 7: Commit**

```bash
git add src/index.css src/components
git commit -m "style: retro sweep for remaining modals, game-over, cleanup"
```

---

## Self-Review

**Spec coverage:**
- 8-bit/Stardew theme → Tasks 2-10 (parchment + wood + hard shadows + square corners across all 2D surfaces).
- RetroPix font → Task 1 (self-hosted, with OFL fallback + license caveat, per "you source it").
- Button designs in `public/assets/images/ui` → the 3 PNG nav buttons are preserved as-is (Task 3); all other buttons use CSS pixel-art (`.btn`, Task 2), per the chosen approach.
- Wood texture reference → drives the palette tokens (Task 1) and is used as a real background on `.wooden-panel` and the store-entry sign (Tasks 2, 5); the broken `.png.png` filename is fixed (Task 1).
- "Everything (2D UI)" scope → dashboard (3-5), modals (6, 7, 10), story + notifications (8), 3D sidebar overlay (9). 3D scene explicitly excluded per scope answer.
- Token refactor → Task 1 establishes tokens; all tasks consume them; Task 10 optionally removes aliases.

**Placeholder scan:** No "TBD"/"handle edge cases"/"similar to Task N". Steps that restyle many similar rules (Tasks 7, 10) give the exact property values and the exact selector list rather than deferring. Component edits show concrete before/after JSX.

**Type/name consistency:** Token names (`--paper`, `--wood-dark`, `--ink`, `--pixel-shadow`, `--font-pixel`, `--accent-gold`, etc.) are defined once in Task 1 Step 4 and reused verbatim. New utility classes (`.tab-row`, `.tab-btn`, `.info-note`, `.modal-footer-row`, `.modal-wide`) are defined in Task 6 Step 1 before use. The font file is standardized to `public/assets/fonts/PixelFont.ttf` regardless of which font is chosen, so the `@font-face` `src` never drifts.

**Note on verification:** Because there is no test runner, every task verifies via `npm run build` + a named on-screen visual check. This is intentional and stated in Global Constraints; do not fabricate unit tests for CSS.

# Electric Nocturne Design System Alignment — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring all CSS files into full compliance with the "Electric Nocturne" design system — correct colors, remove layout borders (No-Line Rule), add glassmorphism + gradient CTA on charades menu.

**Architecture:** Token-first: Task 1 removes `--color-border`/`--color-border-hover` from tokens and introduces new surface hierarchy + colors. Tasks 2–6 migrate every existing usage of those removed tokens. Task 4 adds glassmorphism + gradient button effects. All tasks must run sequentially — later tasks depend on tokens from Task 1.

**Tech Stack:** CSS Modules, CSS custom properties, Next.js 14 (apps/hub), @party/ui shared package (packages/ui), Turborepo monorepo.

---

## Codebase Context

- Working directory: `C:\Users\Mateo\Desktop\Party`
- Spec: `docs/superpowers/specs/2026-03-23-electric-nocturne-design-system.md`
- Shared UI package: `packages/ui/src/` — imported as `@party/ui` by hub
- Game-specific files: `apps/hub/src/app/games/charades/` and `apps/hub/src/components/charades/`
- Build check command: `cd apps/hub && npx next build 2>&1 | tail -20`
- Token search command: `grep -r "var(--color-border" packages/ apps/ --include="*.css"`

## No Testing Framework

This project has no unit tests for CSS. Verification = build check + grep for removed tokens. Do NOT invent tests. The build check catches TypeScript/import errors. Visual verification is out of scope for this plan.

---

## File Map

| File | Task | Change |
|------|------|--------|
| `packages/ui/src/tokens.css` | 1 | Full replacement — new surface hierarchy, remove border tokens, update colors |
| `apps/hub/src/app/games/charades/theme.css` | 2 | Full replacement — new primary `#d095ff` |
| `packages/ui/src/Topbar/Topbar.module.css` | 3 | Remove border-bottom, update authBtn border token |
| `packages/ui/src/GameSidebar/GameSidebar.module.css` | 3 | Remove border-right/border-top, add sidebar background |
| `packages/ui/src/GameCard/GameCard.module.css` | 3 | Update card border token |
| `apps/hub/src/app/games/charades/page.module.css` | 4 | Glassmorphism card, gradient pill CTA, remove border |
| `apps/hub/src/app/games/charades/play/page.module.css` | 5 | Remove topbar border-bottom |
| `apps/hub/src/app/games/charades/results/page.module.css` | 6 | Update menuBtn border token |
| `apps/hub/src/app/games/charades/config/page.module.css` | 6 | Update settingsBtn border token |
| `apps/hub/src/components/charades/Podium/Podium.module.css` | 6 | Remove restItem border |
| `apps/hub/src/components/charades/QRPairing/QRPairing.module.css` | 6 | Remove qrWrapper border, update disconnectBtn |
| `apps/hub/src/components/charades/SettingsModal/SettingsModal.module.css` | 6 | Remove modal border |
| `apps/hub/src/components/charades/CategoryPicker/CategoryPicker.module.css` | 6 | Update card border token |
| `apps/hub/src/components/charades/PlayerList/PlayerList.module.css` | 6 | Remove item border, update gender badge |
| `apps/hub/src/components/charades/PlayerForm/PlayerForm.module.css` | 6 | Remove form border, update buttons/inputs |
| `apps/hub/src/components/PremiumModal/PremiumModal.module.css` | 6 | Remove modal border, update closeButton |

---

## Task 1: Replace tokens.css — new surface hierarchy, remove border tokens

**Files:**
- Modify: `packages/ui/src/tokens.css`

- [ ] **Step 1: Read the current file**

```bash
cat packages/ui/src/tokens.css
```

- [ ] **Step 2: Replace entire file content**

Write exactly this content to `packages/ui/src/tokens.css`:

```css
:root {
  /* Surface hierarchy — 3 levels (Electric Nocturne spec) */
  --color-bg: #0e0e0f;
  --color-surface-container: #19191b;
  --color-surface-elevated: #262627;

  /* Legacy surface tokens kept for compatibility */
  --color-surface: rgba(255, 255, 255, 0.04);
  --color-surface-hover: rgba(255, 255, 255, 0.08);

  /* Ghost border — accessibility fallback only, never for layout containment */
  --color-outline-variant: rgba(255, 255, 255, 0.15);

  /* Text */
  --color-text: #f0f0f0;
  --color-text-muted: #adaaab;

  /* Interaction */
  --color-focus-outline: rgba(255, 255, 255, 0.4);
  --color-overlay: rgba(0, 0, 0, 0.7);
  --color-topbar-bg: rgba(14, 14, 15, 0.85);

  /* Layout */
  --topbar-height: 72px;
  --sidebar-width: 240px;

  /* Typography */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;

  /* Game theme defaults (overridden per-game in theme.css) */
  --game-color-primary: #d095ff;
  --game-color-primary-light: #c782ff;
  --game-color-primary-glow: rgba(208, 149, 255, 0.15);
  --game-gradient: linear-gradient(135deg, #d095ff, #c782ff);
}
```

**What changed vs before:**
- `--color-bg`: `#0a0a0a` → `#0e0e0f`
- `--color-surface-container`: NEW (was missing)
- `--color-surface-elevated`: `#141414` → `#262627`
- `--color-text-muted`: `rgba(240,240,240,0.5)` → `#adaaab`
- `--color-topbar-bg`: `rgba(10,10,10,0.9)` → `rgba(14,14,15,0.85)`
- `--color-outline-variant`: NEW (replaces `--color-border`)
- `--color-border`: REMOVED
- `--color-border-hover`: REMOVED
- `--game-color-primary` default: `#7c3aed` → `#d095ff`
- `--game-color-primary-light` default: `#a78bfa` → `#c782ff`
- `--game-gradient` default: updated

- [ ] **Step 3: Verify no remaining `--color-border` in this file**

```bash
grep "color-border" packages/ui/src/tokens.css
```

Expected output: empty (no matches)

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/tokens.css
git commit -m "feat: update tokens — Electric Nocturne surface hierarchy, remove border tokens"
```

---

## Task 2: Update charades theme.css — new primary colors

**Files:**
- Modify: `apps/hub/src/app/games/charades/theme.css`

- [ ] **Step 1: Replace entire file content**

Write exactly this to `apps/hub/src/app/games/charades/theme.css`:

```css
:root {
  --game-color-primary: #d095ff;
  --game-color-primary-light: #c782ff;
  --game-color-primary-glow: rgba(208, 149, 255, 0.15);
  --game-gradient: linear-gradient(135deg, #d095ff, #c782ff);
}
```

- [ ] **Step 2: Verify the new colors are present**

```bash
grep "#d095ff" apps/hub/src/app/games/charades/theme.css
```

Expected: 2 matches (primary + gradient line)

- [ ] **Step 3: Commit**

```bash
git add apps/hub/src/app/games/charades/theme.css
git commit -m "feat: update charades theme to Electric Nocturne primary colors"
```

---

## Task 3: Fix @party/ui components — remove layout borders

**Files:**
- Modify: `packages/ui/src/Topbar/Topbar.module.css`
- Modify: `packages/ui/src/GameSidebar/GameSidebar.module.css`
- Modify: `packages/ui/src/GameCard/GameCard.module.css`

- [ ] **Step 1: Read all three files**

```bash
cat packages/ui/src/Topbar/Topbar.module.css
cat packages/ui/src/GameSidebar/GameSidebar.module.css
cat packages/ui/src/GameCard/GameCard.module.css
```

- [ ] **Step 2: Edit Topbar.module.css**

Make these 3 targeted edits (use Edit tool, not full replacement):

1. In `.topbar`: remove the line `border-bottom: 1px solid var(--color-border);`
2. In `.authBtn`: change `border: 1px solid var(--color-border)` → `border: 1px solid var(--color-outline-variant)`
3. In `.authBtn:hover`: change `border-color: var(--color-border-hover)` → `border-color: rgba(255, 255, 255, 0.25)`

- [ ] **Step 3: Edit GameSidebar.module.css**

Make these 3 targeted edits:

1. In `.sidebar`: remove line `border-right: 1px solid var(--color-border);`, add new line `background: var(--color-surface-container);`
2. In `.bottom`: remove line `border-top: 1px solid var(--color-border);`
3. In `.tabBar`: remove line `border-top: 1px solid var(--color-border);`

- [ ] **Step 4: Edit GameCard.module.css**

Read the file first to find the exact lines, then:

1. In `.card`: change `border: 1px solid var(--color-border)` → `border: 1px solid var(--color-outline-variant)`
2. In `.card:hover`: change `border-color: var(--color-border-hover)` → `border-color: rgba(255, 255, 255, 0.25)`

- [ ] **Step 5: Verify no --color-border in these files**

```bash
grep "color-border" packages/ui/src/Topbar/Topbar.module.css packages/ui/src/GameSidebar/GameSidebar.module.css packages/ui/src/GameCard/GameCard.module.css
```

Expected output: empty

- [ ] **Step 6: Build check**

```bash
cd apps/hub && npx next build 2>&1 | tail -20
```

Expected: build completes without errors. If errors appear, they'll reference specific files — fix only those.

- [ ] **Step 7: Commit**

```bash
cd ..
git add packages/ui/src/Topbar/Topbar.module.css packages/ui/src/GameSidebar/GameSidebar.module.css packages/ui/src/GameCard/GameCard.module.css
git commit -m "feat: remove layout borders from @party/ui components — No-Line Rule"
```

---

## Task 4: Fix charades menu page — glassmorphism card, gradient CTA

**Files:**
- Modify: `apps/hub/src/app/games/charades/page.module.css`

- [ ] **Step 1: Read the current file**

```bash
cat apps/hub/src/app/games/charades/page.module.css
```

- [ ] **Step 2: Edit .modeCard — remove border, add glassmorphism + ambient shadow**

Find the `.modeCard` rule. Make these edits:

1. Remove: `border: 1px solid var(--color-border);`
2. Change `background: var(--color-surface-elevated)` → `background: rgba(38, 38, 39, 0.6);`
   - Note: `rgba(38, 38, 39, 0.6)` = `#262627` at 60% opacity — hardcoded intentionally for glassmorphism transparency
3. Add after `background`: `backdrop-filter: blur(20px);`
4. Add after that: `box-shadow: 0px 24px 48px rgba(0, 0, 0, 0.4), 0 0 40px rgba(208, 149, 255, 0.06);`

- [ ] **Step 3: Edit .playBtn — gradient + pill shape**

Find the `.playBtn` rule. Make these edits:

1. Change `background: var(--game-color-primary)` → `background: linear-gradient(135deg, #d095ff, #c782ff)`
2. Change `border-radius: 10px` → `border-radius: 9999px`
3. Change `transition: opacity 0.2s` → `transition: box-shadow 0.2s`

- [ ] **Step 4: Edit .playBtn:hover — neon glow instead of opacity**

Find the `.playBtn:hover` rule. Replace its content:

```css
.playBtn:hover {
  box-shadow: 0 0 20px #c57eff;
  opacity: 1;
}
```

- [ ] **Step 5: Verify no --color-border in this file**

```bash
grep "color-border" apps/hub/src/app/games/charades/page.module.css
```

Expected: empty

- [ ] **Step 6: Build check**

```bash
cd apps/hub && npx next build 2>&1 | tail -20
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
cd ..
git add apps/hub/src/app/games/charades/page.module.css
git commit -m "feat: glassmorphism card + gradient pill CTA on charades menu"
```

---

## Task 5: Fix charades play page — remove topbar border

**Files:**
- Modify: `apps/hub/src/app/games/charades/play/page.module.css`

- [ ] **Step 1: Read the file**

```bash
cat apps/hub/src/app/games/charades/play/page.module.css
```

- [ ] **Step 2: Remove topbar border**

Find the rule that contains `border-bottom: 1px solid var(--color-border)` (it will be on a topbar or header selector). Remove that one line.

- [ ] **Step 3: Verify**

```bash
grep "color-border" apps/hub/src/app/games/charades/play/page.module.css
```

Expected: empty

- [ ] **Step 4: Commit**

```bash
git add apps/hub/src/app/games/charades/play/page.module.css
git commit -m "feat: remove layout border from charades play topbar"
```

---

## Task 6: Migrate remaining --color-border usages in components

**Files:**
- Modify: `apps/hub/src/app/games/charades/results/page.module.css`
- Modify: `apps/hub/src/app/games/charades/config/page.module.css`
- Modify: `apps/hub/src/components/charades/Podium/Podium.module.css`
- Modify: `apps/hub/src/components/charades/QRPairing/QRPairing.module.css`
- Modify: `apps/hub/src/components/charades/SettingsModal/SettingsModal.module.css`
- Modify: `apps/hub/src/components/charades/CategoryPicker/CategoryPicker.module.css`
- Modify: `apps/hub/src/components/charades/PlayerList/PlayerList.module.css`
- Modify: `apps/hub/src/components/charades/PlayerForm/PlayerForm.module.css`
- Modify: `apps/hub/src/components/PremiumModal/PremiumModal.module.css`

- [ ] **Step 1: Read all files**

```bash
cat apps/hub/src/app/games/charades/results/page.module.css
cat apps/hub/src/app/games/charades/config/page.module.css
cat apps/hub/src/components/charades/Podium/Podium.module.css
cat apps/hub/src/components/charades/QRPairing/QRPairing.module.css
cat apps/hub/src/components/charades/SettingsModal/SettingsModal.module.css
cat apps/hub/src/components/charades/CategoryPicker/CategoryPicker.module.css
cat apps/hub/src/components/charades/PlayerList/PlayerList.module.css
cat apps/hub/src/components/charades/PlayerForm/PlayerForm.module.css
cat apps/hub/src/components/PremiumModal/PremiumModal.module.css
```

- [ ] **Step 2: Apply changes using the Token Migration Decision Table**

Use the Edit tool on each file. Changes by file:

**`results/page.module.css`:**
- `.menuBtn`: `border: 1px solid var(--color-border)` → `border: 1px solid var(--color-outline-variant)`

**`config/page.module.css`:**
- `.settingsBtn`: `border: 1px solid var(--color-border)` → `border: 1px solid var(--color-outline-variant)`
- `.settingsBtn:hover`: `border-color: var(--color-border-hover)` → `border-color: rgba(255, 255, 255, 0.25)`

**`Podium.module.css`:**
- `.restItem`: remove `border: 1px solid var(--color-border)` entirely (list items use spacing, not borders)

**`QRPairing.module.css`:**
- `.qrWrapper`: remove `border: 1px solid var(--color-border)` entirely (container — tonal background sufficient)
- `.disconnectBtn`: `border: 1px solid var(--color-border)` → `border: 1px solid var(--color-outline-variant)`

**`SettingsModal.module.css`:**
- `.modal`: remove `border: 1px solid var(--color-border)` entirely (modal container — tonal background)

**`CategoryPicker.module.css`:**
- `.card`: `border: 2px solid var(--color-border)` → `border: 2px solid var(--color-outline-variant)`
- `.card:hover`: `border-color: var(--color-border-hover)` → `border-color: rgba(255, 255, 255, 0.25)`

**`PlayerList.module.css`:**
- `.item`: remove `border: 1px solid var(--color-border)` entirely (list separator → spacing only)
- `.gender`: `border: 1px solid var(--color-border)` → `border: 1px solid var(--color-outline-variant)`

**`PlayerForm.module.css`:**
- `.form`: remove `border: 1px solid var(--color-border)` entirely (form container — tonal background)
- `.addBtn`: `border: 2px dashed var(--color-border)` → `border: 2px dashed var(--color-outline-variant)` (keep dashed style)
- `.addBtn:hover`: `border-color: var(--color-border-hover)` → `border-color: rgba(255, 255, 255, 0.25)`
- `.input`: `border: 1px solid var(--color-border)` → `border: 1px solid var(--color-outline-variant)`
- `.genderBtn`: `border: 1px solid var(--color-border)` → `border: 1px solid var(--color-outline-variant)`
- `.cancelBtn`: `border: 1px solid var(--color-border)` → `border: 1px solid var(--color-outline-variant)`

**`PremiumModal.module.css`:**
- `.modal`: remove `border: 1px solid var(--color-border)` entirely (modal container)
- `.closeButton`: `border: 1px solid var(--color-border)` → `border: 1px solid var(--color-outline-variant)`

- [ ] **Step 3: Verify — no remaining --color-border anywhere**

```bash
grep -r "var(--color-border)" packages/ apps/ --include="*.css"
```

Expected: **empty output**. If any matches remain, fix them before continuing.

```bash
grep -r "var(--color-border-hover)" packages/ apps/ --include="*.css"
```

Expected: **empty output**.

- [ ] **Step 4: Build check**

```bash
cd apps/hub && npx next build 2>&1 | tail -20
```

Expected: build completes without errors.

- [ ] **Step 5: Commit**

```bash
cd ..
git add \
  apps/hub/src/app/games/charades/results/page.module.css \
  apps/hub/src/app/games/charades/config/page.module.css \
  apps/hub/src/components/charades/Podium/Podium.module.css \
  apps/hub/src/components/charades/QRPairing/QRPairing.module.css \
  apps/hub/src/components/charades/SettingsModal/SettingsModal.module.css \
  apps/hub/src/components/charades/CategoryPicker/CategoryPicker.module.css \
  apps/hub/src/components/charades/PlayerList/PlayerList.module.css \
  apps/hub/src/components/charades/PlayerForm/PlayerForm.module.css \
  apps/hub/src/components/PremiumModal/PremiumModal.module.css
git commit -m "feat: migrate all --color-border usages to --color-outline-variant or remove (No-Line Rule)"
```

---

## Final Verification

After all tasks complete, run:

```bash
# No border token remnants
grep -r "var(--color-border)" packages/ apps/ --include="*.css"
grep -r "var(--color-border-hover)" packages/ apps/ --include="*.css"

# Clean build
cd apps/hub && npx next build 2>&1 | tail -20
```

All three commands should return clean output (no matches, no errors).

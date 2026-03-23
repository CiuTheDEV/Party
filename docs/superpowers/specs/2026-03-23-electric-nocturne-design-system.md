# Electric Nocturne — Design System Alignment

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bring the current implementation into full compliance with the "Electric Nocturne" design system defined in `DESIGN.md`.

**Architecture:** Token-first changes — update `tokens.css` and `theme.css` first, then fix component CSS files that violate the No-Line Rule and missing visual effects. No new components needed.

**Tech Stack:** CSS Modules, CSS custom properties, Next.js (apps/hub), @party/ui (packages/ui)

---

## Reference: DESIGN.md Rules Being Implemented

### Colors (DESIGN.md §2)
- Background (surface): `#0e0e0f`
- Surface container (secondary content): `#19191b`
- Surface container highest (floating/elevated): `#262627`
- Primary: `#d095ff`
- Primary container: `#c782ff`
- Primary glow: `rgba(208, 149, 255, 0.15)`
- on_surface_variant (muted text): `#adaaab`
- Ghost border (accessibility fallback): `rgba(255,255,255,0.15)`

### No-Line Rule (DESIGN.md §2)
Borders (`1px solid`) are **prohibited for layout/section containment only**. This means:
- Topbar bottom border → remove
- Sidebar dividing lines → remove, use tonal background instead
- Modal/card containers → remove, use tonal background or glassmorphism
- Player list item separators → remove, use spacing

Borders are **permitted** on:
- Interactive elements (buttons, inputs, selectable cards) — use `--color-outline-variant`
- Accessibility "Ghost Borders" at 15% opacity — use `--color-outline-variant`

### Glass & Gradient Rule (DESIGN.md §2)
- Primary CTA: gradient `#d095ff → #c782ff` at 135deg
- Floating cards: `backdrop-filter: blur(20px)` + semi-transparent surface color

### Elevation & Depth (DESIGN.md §4)
- Ambient shadow: `0px 24px 48px rgba(0,0,0,0.4)`
- Primary energize glow (second layer): `0 0 40px rgba(208,149,255,0.06)`

### Buttons (DESIGN.md §5)
- Primary: gradient `#d095ff → #c782ff`, `border-radius: 9999px` (pill)
- Hover: `box-shadow: 0 0 20px #c57eff` (neon glow, replaces opacity)

---

## Token Migration Decision Table

This table defines what to do with every `--color-border` usage in the codebase:

| Usage type | Example | Action |
|-----------|---------|--------|
| Layout separator (topbar, sidebar, tabBar) | `border-bottom` on topbar | **Remove** — use tonal shift |
| Section container (modal, card, form container) | `.modal { border }` | **Remove** — use tonal background |
| List item separator | `.item { border }` | **Remove** — use spacing or tonal tint |
| Interactive button border | `.authBtn { border }` | **Replace** with `--color-outline-variant` |
| Interactive input border | `.input { border }` | **Replace** with `--color-outline-variant` |
| Selectable card border | `.card { border }` (CategoryPicker) | **Keep**, replace with `--color-outline-variant` |
| Dashed "add" button | `.addBtn { border: 2px dashed }` | **Keep** dashed style, replace token |
| Hover state | `border-color: var(--color-border-hover)` | **Replace** with `rgba(255,255,255,0.25)` |
| Gender/metadata badge | `.gender { border }` | **Replace** with `--color-outline-variant` |

`--color-border` token is **removed** from `tokens.css` after all usages are migrated.
`--color-border-hover` token is **removed** from `tokens.css` after all usages are migrated.

---

## Files to Modify

### @party/ui (packages/ui)
| File | Change summary |
|------|----------------|
| `packages/ui/src/tokens.css` | New color tokens, 3-level surface hierarchy, remove `--color-border`, `--color-border-hover` |
| `packages/ui/src/Topbar/Topbar.module.css` | Remove border-bottom (layout), update authBtn border to `--color-outline-variant` |
| `packages/ui/src/GameCard/GameCard.module.css` | Update card border to `--color-outline-variant` |
| `packages/ui/src/GameSidebar/GameSidebar.module.css` | Remove border-right, border-top; add sidebar background `--color-surface-container` |

### apps/hub (charades game)
| File | Change summary |
|------|----------------|
| `apps/hub/src/app/games/charades/theme.css` | New primary colors `#d095ff` |
| `apps/hub/src/app/games/charades/page.module.css` | Glassmorphism card, gradient pill CTA, ambient shadow, remove border |
| `apps/hub/src/app/games/charades/play/page.module.css` | Remove topbar border-bottom |
| `apps/hub/src/app/games/charades/results/page.module.css` | Update menuBtn border to `--color-outline-variant` |
| `apps/hub/src/app/games/charades/config/page.module.css` | Update settingsBtn border to `--color-outline-variant` |
| `apps/hub/src/components/charades/Podium/Podium.module.css` | Remove .restItem border (list item — use spacing) |
| `apps/hub/src/components/charades/QRPairing/QRPairing.module.css` | Remove qrWrapper border (container), update disconnectBtn to `--color-outline-variant` |
| `apps/hub/src/components/charades/SettingsModal/SettingsModal.module.css` | Remove modal border (container — use tonal background) |
| `apps/hub/src/components/charades/CategoryPicker/CategoryPicker.module.css` | Update card border to `--color-outline-variant` |
| `apps/hub/src/components/charades/PlayerList/PlayerList.module.css` | Remove .item border (list separator), update .gender badge to `--color-outline-variant` |
| `apps/hub/src/components/charades/PlayerForm/PlayerForm.module.css` | Remove .form border (container), update buttons/inputs/dashed to `--color-outline-variant` |
| `apps/hub/src/components/PremiumModal/PremiumModal.module.css` | Remove modal border (container), update closeButton to `--color-outline-variant` |

---

## Task 1: Update tokens.css — new color tokens

**Files:**
- Modify: `packages/ui/src/tokens.css`

Replace the entire file content:

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

Note: `--color-border` and `--color-border-hover` are intentionally removed. All usages in other files must be migrated before removing from tokens.

**Verification after task:** `grep -r "var(--color-border)" packages/ apps/` must return 0 results.

---

## Task 2: Update charades theme.css

**Files:**
- Modify: `apps/hub/src/app/games/charades/theme.css`

Replace entire file:

```css
:root {
  --game-color-primary: #d095ff;
  --game-color-primary-light: #c782ff;
  --game-color-primary-glow: rgba(208, 149, 255, 0.15);
  --game-gradient: linear-gradient(135deg, #d095ff, #c782ff);
}
```

---

## Task 3: Fix @party/ui component CSS files

**Files:**
- Modify: `packages/ui/src/Topbar/Topbar.module.css`
- Modify: `packages/ui/src/GameSidebar/GameSidebar.module.css`
- Modify: `packages/ui/src/GameCard/GameCard.module.css`

### Topbar.module.css changes:
1. `.topbar`: remove `border-bottom: 1px solid var(--color-border)`
2. `.authBtn`: change `border: 1px solid var(--color-border)` → `border: 1px solid var(--color-outline-variant)`
3. `.authBtn:hover`: change `border-color: var(--color-border-hover)` → `border-color: rgba(255, 255, 255, 0.25)`

### GameSidebar.module.css changes:
1. `.sidebar`: remove `border-right: 1px solid var(--color-border)`, add `background: var(--color-surface-container)`
2. `.bottom`: remove `border-top: 1px solid var(--color-border)`
3. `.tabBar`: remove `border-top: 1px solid var(--color-border)` (keep glassmorphism backdrop-filter)

### GameCard.module.css changes:
1. `.card`: change `border: 1px solid var(--color-border)` → `border: 1px solid var(--color-outline-variant)`
2. `.card:hover`: change `border-color: var(--color-border-hover)` → `border-color: rgba(255, 255, 255, 0.25)`

---

## Task 4: Fix charades page.module.css — glassmorphism, gradient CTA, ambient shadow

**Files:**
- Modify: `apps/hub/src/app/games/charades/page.module.css`

### modeCard — remove border, add glassmorphism + ambient shadow:
```css
/* Remove: border: 1px solid var(--color-border); */
/* rgba(38, 38, 39, 0.6) = #262627 at 60% opacity — hardcoded intentionally for glassmorphism */
background: rgba(38, 38, 39, 0.6);
backdrop-filter: blur(20px);
box-shadow: 0px 24px 48px rgba(0, 0, 0, 0.4), 0 0 40px rgba(208, 149, 255, 0.06);
```
All other modeCard properties remain unchanged.

### playBtn — gradient + pill + neon glow:
Primary CTA buttons use gradient + neon glow per DESIGN.md §5. Secondary buttons (ghost style) use standard opacity. Only `.playBtn` gets this treatment.
```css
background: linear-gradient(135deg, #d095ff, #c782ff);
border-radius: 9999px;
color: #fff;
transition: box-shadow 0.2s;
/* Remove: transition: opacity 0.2s */
```

### playBtn:hover:
```css
/* Replace: opacity: 0.85 */
box-shadow: 0 0 20px #c57eff;
opacity: 1;
```

Note: `.badge` border (`border: 1px solid var(--game-color-primary)`) is NOT changed — it uses the game-themed primary color intentionally. After Task 2 updates primary to `#d095ff`, the badge will automatically reflect the new color.

---

## Task 5: Fix charades play page

**Files:**
- Modify: `apps/hub/src/app/games/charades/play/page.module.css`

`.topbar`: remove `border-bottom: 1px solid var(--color-border)`

---

## Task 6: Fix charades interactive UI components

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

Apply the Token Migration Decision Table from above. Specific changes:

**results/page.module.css:**
- `.menuBtn border` → `border: 1px solid var(--color-outline-variant)`

**config/page.module.css:**
- `.settingsBtn border` → `border: 1px solid var(--color-outline-variant)`
- `.settingsBtn:hover border-color` → `rgba(255, 255, 255, 0.25)`

**Podium.module.css:**
- `.restItem border` → remove (list item separator — use existing spacing)

**QRPairing.module.css:**
- `.qrWrapper border` → remove (card container — tonal background is sufficient)
- `.disconnectBtn border` → `border: 1px solid var(--color-outline-variant)`

**SettingsModal.module.css:**
- `.modal border` → remove (modal container — tonal background sufficient)

**CategoryPicker.module.css:**
- `.card border` → `border: 2px solid var(--color-outline-variant)`
- `.card:hover border-color` → `rgba(255, 255, 255, 0.25)`

**PlayerList.module.css:**
- `.item border` → remove (list item — use spacing)
- `.gender border` → `border: 1px solid var(--color-outline-variant)`

**PlayerForm.module.css:**
- `.form border` → remove (form container — tonal background)
- `.addBtn border` → `border: 2px dashed var(--color-outline-variant)` (keep dashed style)
- `.addBtn:hover border-color` → `rgba(255, 255, 255, 0.25)`
- `.input border` → `border: 1px solid var(--color-outline-variant)`
- `.genderBtn border` → `border: 1px solid var(--color-outline-variant)`
- `.cancelBtn border` → `border: 1px solid var(--color-outline-variant)`

**PremiumModal.module.css:**
- `.modal border` → remove (modal container)
- `.closeButton border` → `border: 1px solid var(--color-outline-variant)`

---

## Acceptance Criteria

- [ ] `tokens.css` uses `#0e0e0f` as base bg, 3 surface levels, no `--color-border` or `--color-border-hover`
- [ ] `grep -r "var(--color-border)" packages/ apps/` returns 0 results
- [ ] `grep -r "var(--color-border-hover)" packages/ apps/` returns 0 results
- [ ] Charades `theme.css` uses `#d095ff` as primary
- [ ] Play button is pill-shaped (9999px), gradient background, neon glow on hover
- [ ] modeCard: glassmorphism (`backdrop-filter: blur(20px)`), ambient shadow, no border
- [ ] Topbar: no `border-bottom`
- [ ] Sidebar: no `border-right`, separation by tonal background (`#19191b` vs `#0e0e0f`)
- [ ] Sidebar `.bottom` and `.tabBar`: no `border-top`
- [ ] All interactive elements use `--color-outline-variant` instead of `--color-border`
- [ ] All layout containers have borders removed (rely on tonal shift)
- [ ] Build passes: `cd apps/hub && npx next build` (no type/lint errors)

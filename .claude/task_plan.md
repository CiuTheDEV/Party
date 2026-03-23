# Task: Turborepo Monorepo Init

**Done when:**
- `package.json` w root z workspaces
- `turbo.json` z pipeline
- Struktura folderów: `apps/hub`, `packages/ui`, `packages/game-sdk`, `packages/games/charades`
- Każda paczka ma własny `package.json`
- `npm install` działa bez błędów
- `turbo build` uruchamia się (nawet jeśli nie ma co budować)

---

## Phases

### Phase 1 — Root setup
- [ ] `package.json` (root, workspaces)
- [ ] `turbo.json` (pipeline: build, dev, lint)
- [ ] `.gitignore` — dodać `node_modules`, `.turbo`, `.next`

### Phase 2 — Struktura folderów
- [ ] `apps/hub/package.json`
- [ ] `packages/ui/package.json`
- [ ] `packages/game-sdk/package.json`
- [ ] `packages/games/charades/package.json`

### Phase 3 — Weryfikacja
- [ ] `npm install`
- [ ] `turbo build` (dry run)

---

## Errors
(puste)

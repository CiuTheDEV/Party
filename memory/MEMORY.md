# Project Party — Technical Pitfalls & Lessons Learned

> Written by agents during sessions. Read at the start of every session.
> SSOT for technical gotchas — never write these to today.md.

---

## How to use this file

- Add entries when hitting non-obvious technical issues
- Format: date, symptom, root cause, fix, how to prevent
- Never delete entries — they represent real pain

---

## Entries

### 2026-03-22 — emitDeclarationOnly + runtime import w Next.js

**Symptom:** `Module not found: Can't resolve '@party/charades'` w Next.js dev server po tym jak hub zaimportował `config` z paczki workspace.

**Root cause:** Paczka `@party/charades` była skonfigurowana z `emitDeclarationOnly: true` w tsconfig — kompilator emituje tylko `.d.ts` (deklaracje typów), zero plików `.js`. Next.js/Turbopack szuka runtime JS (`dist/index.js`) gdy robimy value import (`import { config } from '@party/charades'`), ale plik nie istnieje.

**Fix:** Tymczasowo przeniesiony config Kalambury inline do `apps/hub/src/data/games.ts`. Import z `@party/charades` usunięty do czasu gdy paczka będzie miała pełny Next.js build (Phase 3).

**Jak zapobiec:** Paczki types-only (`emitDeclarationOnly`) można importować tylko jako typy (`import type { ... }`). Wartości runtime (const, function) muszą być w paczkach z normalnym buildem JS. Przed importem value z workspace package — sprawdź czy `dist/index.js` istnieje.

---

### 2026-03-22 — Clerk crashuje dev server z placeholder key

**Symptom:** `@clerk/clerk-react: The publishableKey passed to Clerk is invalid` — biały ekran z błędem runtime zamiast strony.

**Root cause:** Clerk waliduje `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` przy każdym renderze, nawet gdy klucz to placeholder (`pk_test_placeholder`).

**Fix:** Tymczasowo usunięty `<ClerkProvider>` z `layout.tsx` i Clerk komponenty z `Topbar.tsx`. Wróci w Phase 5 z prawdziwymi kluczami z dashboard.clerk.com.

**Jak zapobiec:** Clerk wymaga prawdziwego klucza nawet w dev. Albo użyj prawdziwego test key od razu, albo nie dodawaj ClerkProvider dopóki nie masz kluczy.

---

### 2026-03-22 — Next.js 16 modyfikuje tsconfig.json przy pierwszym uruchomieniu

**Symptom:** Po `npm run dev` Next.js automatycznie zmienia `tsconfig.json` — ustawia `jsx: react-jsx` (było `preserve`) i dodaje `.next/dev/types/**/*.ts` do includes.

**Root cause:** Next.js 16 wymusza własne ustawienia TypeScript przy starcie dev servera.

**Fix:** Nie walczyć z tym — zacommitować zmiany wprowadzone przez Next.js.

**Jak zapobiec:** Przy inicjalizacji nowego projektu Next.js — najpierw uruchom dev server, a dopiero potem commituj `tsconfig.json`. Unikniesz commita z "incorrect" konfiguracją.

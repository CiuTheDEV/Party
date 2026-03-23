# Spec: Menu główne Kalamburów

**Date:** 2026-03-23
**Status:** Approved
**Scope:** `apps/hub/src/app/games/charades/page.tsx`, `apps/hub/src/app/games/charades/layout.tsx`, `packages/ui/`

---

## Cel

Przeprojektowanie strony menu kalamburów z obecnej prostej wersji (hero + karta + link) na wersję zgodną z zatwierdzonym mockupem.

---

## Układ strony (`charades/page.tsx`)

Trzy sekcje od góry:

### 1. Hero
- Nowy komponent `GameIcon` (z `@party/ui`) — zaokrąglony kwadrat z gradientowym tłem, emoji gry w środku
- Tytuł: `Kalambury` (duży, bold)
- Podtytuł: `Pokazuj hasła bez słów — tylko gestem i mimiką. Sprawdź, czy Twoi znajomi Cię zrozumieją!`

### 2. Karta trybu (`ModeCard`)
- Nagłówek: "Tryb Klasyczny" + badge "ZALECANY" (po prawej)
- Opis: "Każdy gracz prezentuje hasło po kolei. Gra do wybranej liczby rund. Potrzebujesz drugiego urządzenia dla prezentera."
- Lista detali z ikonami:
  - 👥 2–8 graczy
  - 📱 Jedno urządzenie dla prezentera (telefon)
  - 🎯 Wybierasz kategorie słów i liczbę rund
- Przycisk: "Zagraj Teraz ▶" — duży, fioletowy, pełna szerokość karty, link do `/games/charades/config`

### 3. Stopka
- Trzy nieaktywne linki: "Jak grać?", "Zasady", "Wsparcie" (brak href lub `href="#"`, brak hover efektu)
- Pasek info: ℹ️ "Pamiętaj o bezpiecznej zabawie w grupie!"

---

## Zmiany w `@party/ui`

### Nowy komponent: `GameIcon`
- Props: `emoji: string`, opcjonalnie `size?: 'sm' | 'md' | 'lg'` (domyślnie `md`)
- Wygląd: zaokrąglony kwadrat, gradientowe tło z kolorem akcentu gry (z CSS custom properties theme), emoji wycentrowane
- Plik: `packages/ui/src/GameIcon/GameIcon.tsx` + `GameIcon.module.css`
- Eksportowany z `packages/ui/src/index.ts`

### Rozszerzenie `NavLink`
- Dodać opcjonalne pole `disabled?: boolean`
- Gdy `disabled: true` — link renderuje się bez `href`, z klasą `.disabled` (szary kolor, brak hover, `cursor: default`)

### Rozszerzenie `GameSidebar`
- Obsługa `disabled` linków — renderowanie jako `<span>` zamiast `<a>/<Link>` gdy `disabled: true`

---

## Zmiany w `charades/layout.tsx`

Rozszerzyć listę `links` o:
```ts
{ label: 'Ustawienia', href: '/games/charades/settings', disabled: true },
{ label: 'Rankingi', href: '/games/charades/rankings', disabled: true },
```

---

## Czego NIE robimy

- Brak implementacji logiki Ustawień i Rankingów
- Brak treści dla linków stopki (Jak grać?, Zasady, Wsparcie)
- Brak zmian w stronach config / play / present / results
- Nie dodajemy nowych trybów gry

---

## Pliki do zmiany

| Plik | Zmiana |
|------|--------|
| `apps/hub/src/app/games/charades/page.tsx` | Pełny redesign — hero, karta, stopka |
| `apps/hub/src/app/games/charades/page.module.css` | Nowe style |
| `apps/hub/src/app/games/charades/layout.tsx` | Dodanie disabled linków |
| `packages/ui/src/GameIcon/GameIcon.tsx` | Nowy komponent |
| `packages/ui/src/GameIcon/GameIcon.module.css` | Style GameIcon |
| `packages/ui/src/index.ts` | Eksport GameIcon |
| `packages/ui/src/GameSidebar/GameSidebar.tsx` | Obsługa disabled NavLink |
| `packages/ui/src/types.ts` | Pole `disabled` w NavLink |

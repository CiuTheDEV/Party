# Patterns & Reusable Solutions

> Cross-session reusable patterns discovered during development.
> Add entries when solving non-obvious problems worth remembering.

---

## How to use

- Add when solving a problem that took >10 minutes and is likely to recur
- Format: title, scenario, solution, code snippet if relevant
- Reference from `memory/MEMORY.md` if it's a pitfall, here if it's a positive pattern

---

## Entries

## Config modal jako lokalny stan (nie routing)

**Scenario**: Setup gry — modal konfiguracji przed rozpoczęciem rozgrywki.

**Rozwiązanie**: `useState(false)` w `page.tsx`, nie osobna trasa `/config`. Modal renderowany warunkowo w tym samym komponencie co menu.

**Dlaczego**: Prostsze, zachowuje stan menu (wybrany tryb), łatwy fallback. Stara trasa `/config` była martwym kodem.

---

## SelectedCategories jako Record zamiast Set

**Scenario**: Przekazywanie wybranych kategorii + poziomów trudności przez sessionStorage do strony rozgrywki.

**Rozwiązanie**: `Record<string, ('easy' | 'hard')[]>` zamiast `Record<string, Set<...>>`.

**Dlaczego**: `Set` nie serializuje się do JSON — `JSON.stringify` zwraca `{}`. `Record` z tablicą serializuje się poprawnie.

---

## Shake animation reset przez key

**Scenario**: Animacja shake ma się odtwarzać przy każdym kliknięciu "Rozpocznij" gdy warunki nie są spełnione.

**Rozwiązanie**: `shakeKey` licznik w stanie + `key={`err-${shakeKey}`}` na elemencie z animacją. React odmontowuje i remontuje element, co resetuje animację CSS.

**Dlaczego**: Sama klasa CSS z `animation` nie odpala się ponownie jeśli element już ją ma — trzeba wymusić remount.

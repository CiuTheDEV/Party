# Design: Kalambury — Phase 3

*Data: 2026-03-22*
*Status: Zatwierdzony przez product ownera*

---

## Cel

Zbudowanie kompletnego modułu Kalambury: konfiguracja gry, rozgrywka z osobnym urządzeniem prezentera (telefon), wyniki. Tryb "Klasyczny" — każdy gracz prezentuje po kolei, gra do X rund.

---

## Architektura

### Synchronizacja urządzeń — Partykit

Host i telefon prezentera komunikują się przez Partykit (websocket). Telefon parowany jest **raz w konfiguracji** poprzez QR kod — pozostaje połączony przez całą grę. Hasło pojawia się wyłącznie na telefonie prezentera, nigdy na ekranie hosta.

**Parowanie jest obowiązkowe** — bez połączonego urządzenia przycisk "Rozpocznij grę" pozostaje nieaktywny.

### Partykit — eventy i przepływ danych

Room ID generowany przy wejściu na `/config`, zakodowany w QR jako URL `/present?room=ROOM_ID`.

**Eventy wysyłane przez hosta:**
```ts
{ type: 'TURN_START', turnId: string, word: string, category: string, presenterName: string, timerSeconds: number }
{ type: 'TIMER_TICK', turnId: string, remaining: number }  // co sekundę
{ type: 'TURN_END', turnId: string, reason: 'timeout' | 'verdict' }
{ type: 'BETWEEN_TURNS', nextPresenterName: string, nextPresenterAvatar: string }
{ type: 'GAME_END' }
{ type: 'GAME_RESET' }  // "Zagraj jeszcze raz" — zeruje stan prezentera
```

**Eventy wysyłane przez telefon prezentera:**
```ts
{ type: 'PRESENTER_READY', turnId: string }  // prezenter kliknął "Gotowy"
{ type: 'DEVICE_CONNECTED' }                 // telefon dołączył do rooma
```

Każdy event tury zawiera `turnId` (UUID generowany przez hosta przy `TURN_START`). Telefon ignoruje `PRESENTER_READY` echo i eventy z innym `turnId` niż aktualny — zapobiega race condition ze starymi eventami.

**Handshake startu tury:**
1. Host klika "Wyślij hasło" → generuje `turnId`, wysyła `TURN_START`
2. Telefon wyświetla hasło, pokazuje przycisk "Gotowy"
3. Prezenter klika "Gotowy" → telefon wysyła `PRESENTER_READY` z tym samym `turnId`
4. Host odbiera `PRESENTER_READY` (waliduje `turnId`) → uruchamia timer
5. Host wysyła `TIMER_TICK` co sekundę (timer autorytatywny po stronie hosta)

**Między turami (`BETWEEN_TURNS`):**
- Host wysyła `BETWEEN_TURNS` automatycznie po wydaniu werdyktu (przed przejściem do następnej tury)
- Telefon wyświetla "Za chwilę następna tura" + imię/avatar kolejnego prezentera
- Host po 2s przechodzi do nowej tury (lub ręcznie klika "Następna tura")

**Rozłączenie urządzenia w trakcie tury:**
- Timer kontynuuje (host jest autorytatywny)
- Host widzi status "📵 Urządzenie rozłączone"
- Werdykt można wydać niezależnie od statusu telefonu
- Telefon po ponownym połączeniu dostaje aktualny `RoomState` z serwera Partykit i renderuje odpowiedni stan

### Stan gry

Przechowywany w pamięci Partykit room (serwer). Room żyje dopóki host jest połączony — Partykit niszczy room automatycznie gdy wszyscy klienci się rozłączą. Zamknięcie karty hosta = koniec rooma. `sessionStorage` hosta to backup tylko na wypadek przeładowania strony — nie rozwijamy scenariuszy crashu w Phase 3.

**Kształt stanu rooma:**
```ts
type RoomState = {
  phase: 'waiting' | 'turn' | 'between' | 'ended'
  currentTurnId: string
  currentWord: string
  currentCategory: string
  currentPresenter: string
  timerRemaining: number
  nextPresenterName: string
  nextPresenterAvatar: string
}
```

### Routing Next.js

```
/games/charades/              → GameMenu
/games/charades/config        → strona konfiguracji (SetupPage)
/games/charades/play          → GameScreen host
/games/charades/present       → GameScreen prezenter (telefon)
/games/charades/results       → GameResults
```

`/present` — trasa bez nawigacji, pełnoekranowa, otwierana przez QR.

### GameModule contract — rozszerzenie

Ekrany rozgrywki (`/play`, `/present`) są **poza** GameModule SDK — to trasy Next.js specyficzne dla Kalambury, nie komponenty wielokrotnego użytku. GameModule SDK eksportuje tylko:

```ts
GameModule = {
  config: GameConfig          // metadane gry
  GameMenu: ComponentType     // ekran wyboru trybu
  GameSetup: ComponentType    // strona konfiguracji (dawniej GameConfigModal)
  GameResults: ComponentType<GameResultsProps>
}
```

`GameConfig` wymaga nowych pól:
```ts
modes: string[]       // dostępne tryby, np. ['classic']
categories: string[]  // ID kategorii z content/charades/
```

---

## Ekrany

### GameMenu (`/games/charades/`)

- Opis trybu "Klasyczny": każdy prezentuje po kolei, gra do X rund
- Przycisk "Zagraj" → `/games/charades/config`

---

### SetupPage — strona konfiguracji (`/games/charades/config`)

Trzy sekcje na jednej stronie:

**1. Gracze**
- Przycisk "Dodaj gracza" → inline formularz:
  - Nazwa gracza (tekst, wymagane)
  - Avatar (emoji picker, ~12 opcji)
  - Płeć: "on" / "ona" / "—" (wpływa na komunikat "pokazuje on/ona/[imię]")
- Lista dodanych graczy z możliwością usunięcia
- Minimum 2 graczy

**2. Talia**
- Lista kategorii z `content/charades/` (nazwa + liczba słów)
- Wielokrotny wybór — hasła mieszane z wybranych kategorii
- Minimum 1 kategoria

**3. Parowanie urządzenia**
- QR kod (Partykit room ID w URL) widoczny od razu
- Po połączeniu: "📱 Urządzenie połączone" + opcja rozłączenia
- **Parowanie obowiązkowe** — bez urządzenia "Rozpocznij grę" nieaktywne

**Modal "Ustawienia trybu"** (otwierany przyciskiem):
- Liczba rund (suwak: 1–10, domyślnie 3)
- Czas na hasło (suwak: 30s–120s, domyślnie 60s)
- Zamknięcie: X lub kliknięcie poza modalem

**Przycisk "Rozpocznij grę"**
- Aktywny gdy: ≥2 graczy + ≥1 kategoria + urządzenie połączone
- Losuje kolejność graczy
- Miesza hasła z wybranych kategorii, tworzy pulę na całą grę
- Przechodzi do `/games/charades/play`

---

### GameScreen — host (`/games/charades/play`)

Pełnoekranowy widok na TV / dużym monitorze.

**Topbar:** nazwa gry, runda X/Y, wynik każdego gracza (imię + punkty)

**Centrum:**
- Duży avatar + nazwa aktualnego prezentera
- Komunikat "pokazuje on / pokazuje ona / pokazuje [imię]" (zależnie od płci)
- Status połączenia urządzenia (ikona)

**Flow tury:**
1. Host klika "Wyślij hasło" → wysyłane `TURN_START` do telefonu
2. Czekanie na `PRESENTER_READY` — przycisk "Czekam na gotowość..."
3. Telefon wysyła "Gotowy" → host startuje timer
4. Timer odlicza (duży, widoczny); host wysyła `TIMER_TICK` co sekundę
5. Po czasie lub wcześniej — host klika werdykt:
   - **"Zgadnięto ✓"** — gracz dostaje punkt, `TURN_END`
   - **"Nie zgadnięto ✗"** — brak punktu, `TURN_END`
6. Automatyczne przejście do następnego prezentera (lub wyniki)

**Opcje:**
- Menu (⋮) → "Rozłącz urządzenie" — wysyła `GAME_END` (telefon wyświetla "Gra zakończona"), niszczy room, wraca do `/config` z nowym Room ID i nowym QR kodem. Telefon musi zeskanować nowy QR żeby dołączyć ponownie.

---

### GameScreen — prezenter (`/games/charades/present`)

Pełnoekranowy widok na telefonie. Jeden telefon przez całą grę — podawany między prezenterami.

**Stan: Twoja tura**
- Imię prezentera (duże, u góry)
- Hasło (bardzo duże, centrum)
- Kategoria (mała, pod hasłem)
- Przycisk "Gotowy" → wysyła `PRESENTER_READY`

**Stan: Czas trwa**
- Hasło nadal widoczne
- Pasek timera (zsynchronizowany z hostem przez `TIMER_TICK`)

**Stan: Koniec czasu**
- "Koniec czasu!" — czeka na werdykt hosta
- Hasło ukryte

**Stan: Między turami** (po `BETWEEN_TURNS`)
- "Za chwilę następna tura"
- Imię + avatar kolejnego prezentera
- (Podaj telefon kolejnej osobie)

---

### GameResults (`/games/charades/results`)

**Układ:**
- Podium: miejsca 1/2/3 z avatarem, nazwą i wynikiem
- Pełna lista graczy z punktami (dla >3 graczy)
- Przyciski:
  - **"Zagraj jeszcze raz"** — host wysyła `GAME_RESET`, telefon wraca do stanu neutralnego; nowa pula słów, kolejność graczy losowana od nowa, punkty zerowane, telefon pozostaje połączony → `/play`
  - **"Wróć do menu"** → wysyła `GAME_END`, telefon wyświetla "Gra zakończona. Możesz zamknąć tę kartę." → `/games/charades/`

---

## Dane — talia słów

Hasła w `content/charades/` jako pliki TypeScript, pogrupowane w kategorie.

```
content/charades/
├── animals.ts
├── movies.ts
├── sport.ts
└── index.ts   ← eksportuje wszystkie kategorie
```

**Typ kategorii:**
```ts
type WordCategory = {
  id: string
  name: string        // po polsku, wyświetlana w UI
  words: string[]
}
```

**Pula słów na sesję:**
- Hasła z wybranych kategorii mieszane losowo w jeden array
- Losowanie bez powtórzeń w ramach jednej sesji gry
- Wyczerpanie puli: jeśli wszystkie hasła zostały użyte — tworzona jest nowa przetasowana pula z tych samych kategorii i losowanie zaczyna się od początku. Hasła mogą się powtórzyć między pulami, ale nie bezpośrednio po sobie.
- Minimalna zawartość kategorii: brak hard minimum — UI pokazuje liczbę słów przy każdej kategorii, host decyduje świadomie

---

## Czego NIE ma w Phase 3

- Multiplayer przez internet z wieloma widzami (Phase 4)
- Konta użytkowników / leaderboard (Phase 5 — Clerk)
- Własne hasła wpisywane przez hosta
- Wiele urządzeń prezenterów jednocześnie
- Tryb bez urządzenia pomocniczego
- i18n / wielojęzyczność
- Difficulty levels dla kategorii

---

## Kryteria ukończenia Phase 3

- [ ] Host może skonfigurować grę (gracze, talia, ustawienia)
- [ ] Telefon parowany przez QR, parowanie obowiązkowe do startu
- [ ] Handshake: hasło na telefon → "Gotowy" → timer na hoscie
- [ ] Timer autorytatywny po stronie hosta, tick synchronizowany do telefonu
- [ ] Werdykt i punktacja działają poprawnie
- [ ] Kolejność graczy losowana, rotacja automatyczna
- [ ] Wyczerpanie puli słów obsługiwane bez crashu
- [ ] "Zagraj jeszcze raz" zeruje punkty, losuje kolejność, nie rozłącza telefonu
- [ ] Ekran wyników z podium
- [ ] Responsywność: host na desktop, prezenter na mobile

# Today - 2026-04-18

### S63 (16:21~) [Repo/Tooling] Playwright clean reinstall + cleanup pass

- Zrobiono czystą reinstalację Playwrighta: usunięto stare artefakty i browser cache, zainstalowano `@playwright/test` od nowa oraz pobrano świeży Chromium pod właściwy build.
- Dodano wygodny tryb `npm run test:e2e:live`, żeby testy leciały w widocznej przeglądarce z wolniejszym tempem klików; zwykły `npm run test:e2e` i tryb `live` przechodzą.
- Przeprowadzono bezpieczny cleanup repo: usunięto śledzone lokalne artefakty `.partykit/`, `.superpowers/`, `.playwright-mcp/`, bieżące raporty/logi oraz wygenerowane pliki `js/d.ts` z `packages/ui/src/host-navigation/`.
- Zostawiono celowo `rules/`, `docs/`, `memory/`, agent/tooling folders oraz rootowe utility, które nie są jeszcze jednoznacznie martwe.
- Next: jeśli repo ma być jeszcze chudsze, zrobić osobny pass pod nieużywane rootowe utility, stare workflowowe katalogi i ciężkie assety po świadomej decyzji właściciela.
- Experience recorded: yes

### S62 (2026-04-19) [Tajniacy] Rewers kart 1:1 z mockupu + typography fix

- Przeniesiono zaakceptowany rewers kart Tajniaków z mockupu do shared runtime componentu dla hosta i kapitana.
- Usunięto stare tło z dużym `X`, przywrócono techniczną kratkę, narożne napisy `SEKTOR 05` / `OPERACJA TAJNIACY` oraz środkowy badge `🕵️` z etykietą `TAJNIACY`.
- Dodano wariant `compact` dla realnych kart 5x5, żeby rewers nie rozpychał małych kart na planszy.
- Naprawiono dziedziczenie fontu: hostowy awers kart jawnie dziedziczy runtime typography, a shared rewers nie nadpisuje już kroju na `monospace`, więc awers i rewers wróciły do `Space Grotesk`.
- Weryfikacja przechodzi: `npm run test:card-back --workspace @party/codenames`, `npm run test:runtime-fonts --workspace @party/codenames`, `npm run build --workspace @party/codenames`.
- Experience recorded: yes

### S61 (2026-04-19) [Tajniacy] Presenter ready gate + assassin flow polish

- Dodano realtime flow `Gotowy` dla kapitanów: plansza po wejściu do pokoju i po każdej nowej rundzie startuje zakryta, a host widzi tylko rewersy do momentu, aż oboje kapitanowie potwierdzą gotowość.
- Dodano nowe pola stanu i event `CAPTAIN_READY` w PartyKit dla Tajniaków oraz reset gotowości przy starcie nowej planszy / rundy.
- Intro rundy odpala się dopiero po odblokowaniu planszy, a nie po samym `GAME_START`.
- Na ekranie prezentera komunikaty runtime przeszły z bannera do pełnoekranowego modala; po kliknięciu zabójcy widać najpierw neutralne `Ktoś trafił zabójcę`, a dopiero po decyzji hosta informację, kto trafił.
- Weryfikacja przechodzi: `npm run test:authority:codenames --workspace @party/partykit`, `npm run test:runtime-status --workspace @party/codenames`, `npm run test:captain-pairing --workspace @party/codenames`, `npm run build --workspace @party/codenames`.
- `npm run build --workspace @party/hub` ponownie kończy się `spawn EPERM` po etapie `Running TypeScript ...`; wygląda to na ograniczenie sandboxa, nie na regresję kodu.
- Experience recorded: yes

### S60 (2026-04-19) [Tajniacy] QoL pass for setup persistence + runtime alerts

- Dodano trwały draft setupu Tajniaków w `localStorage`: przywracane są nazwy drużyn, avatary, ustawienia trybu, kategorie i `roomId`; flagi połączenia kapitanów resetują się po restore, żeby nie udawać aktywnych urządzeń.
- Dodano ostrzeżenia przeglądarki przy próbie cofnięcia / odświeżenia aktywnej rozgrywki dla hosta i ekranu kapitana oraz modal potwierdzenia przed wygenerowaniem nowej planszy.
- Dodano czytelniejsze komunikaty statusowe runtime dla hosta i prezentera/kapitana: koniec rundy, trafienie zabójcy, utrata hosta i konkretny rozłączony kapitan.
- Dodano focused checks: `npm run test:setup-storage --workspace @party/codenames`, `npm run test:runtime-status --workspace @party/codenames`, `npm run test:captain-pairing --workspace @party/codenames`.
- `npm run build --workspace @party/codenames` przechodzi. `npm run build --workspace @party/hub` dochodzi do Next.js TypeScript phase i kończy się `spawn EPERM`, co wygląda na ograniczenie sandboxa Windows/Codex, nie na błąd aplikacji.
- Experience recorded: yes

### S59 (20:xx~) [Tajniacy] Production PartyKit reconnect/debug

- Zdiagnozowano produkcyjny problem captain flow: ekran wisiał na "Sprawdzam dostępność drużyn...", bo przeglądarka nie zestawiała WebSocket do PartyKit dla `codenames`.
- Potwierdzono, że Cloudflare Pages deployował frontend, ale nie wdrażał automatycznie zmian z `packages/partykit/codenames/server.ts`.
- Zweryfikowano autoryzację PartyKit, uruchomiono `npm run test:authority:codenames --workspace @party/partykit`, a następnie zrobiono ręczny deploy `npx partykit deploy`.
- Po deployu potwierdzono handshake `wss://project-party.ciuthedev.partykit.dev/parties/codenames/...` oraz pierwszy `ROOM_STATE`; produkcyjny flow Tajniaków wrócił do działania.
- Experience recorded: yes

### S58 (16:47~) [Tajniacy] GSAP board reveal + session wrap-up

- Zastąpiono wcześniejsze CSS-owe próby jednym shared GSAP hookiem dla planszy i kart.
- Plansza i captain/host renderują reveal dopiero po zejściu intro; usunięto stare keyframes i cykle remountów.
- Dodano `gsap` + `@gsap/react` do modułu Codenames i zachowano reduced-motion path.
- Buildy przechodzą: `npm run build --workspace @party/codenames` oraz `npm run build --workspace @party/hub`.
- Experience recorded: yes

### S57 (17:00~) [Tajniacy] Runtime finalization + host screen redesign

- Kontynuacja implementacji z poprzedniej sesji (po skompresowaniu kontekstu).
- Zweryfikowano build — przeszedł bez błędów po przepisaniu useHostGame.
- Naprawiono SSR bug w play/page.tsx: useMemo+[] zastąpiony useEffect+useState (sessionStorage czytany po hydratacji).
- Przepisano HostGameScreen.tsx według mockupu: topbar z teamami + status kapitanów + liczniki, bottombar z awatarami odkrytych kart + "Zaczynają: X".
- Usunięto HostGameScreen.module.css i napisano od zera zgodnie z nowym layoutem.
- Build przeszedł po wszystkich zmianach.
- Experience recorded: no

### S56 (2026-04-14) [Project Party] Tajniacy - visual polish + runtime implementation

- Visual polish: fixed hardcoded rgba() colors in Charades and Codenames to use CSS vars.
- Added descriptions to Codenames category cards (Standardowe, +18).
- Fixed section title font size mismatch (28px -> 24px) in Codenames setup.
- Removed redundant Kategorie tile from Codenames SettingsPanel.
- Added CSS Contract section to game-sdk README.
- Added GameWordCategory shared type to game-sdk.
- Created docs/new-game-checklist.md (10-step operational checklist).
- Wrote runtime spec: docs/superpowers/specs/2026-04-14-codenames-runtime-design.md
- Wrote runtime plan: docs/superpowers/plans/2026-04-14-codenames-runtime.md
- Implementing Tajniacy runtime (PartyKit server + host + captain screens).
- Weryfikacja przechodzi: npm run build.
- Experience recorded: yes

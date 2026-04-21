# Today - 2026-04-20

### S75 (13:30~) [Kalambury] 16-player visual polish + ranking tie-breaker

- Dopięto szeroki pass UI dla Kalamburów: menu/setup pod 16 graczy, cleanup kategorii avatarów, modal dodawania/edycji gracza, runtime top bar bez logowania, nowy flow losowania kolejności `4x4`, skip animacji dla `9+`, poprawki verdictów, timeoutów i wyników rund.
- Podsumowanie rundy dostało nowy poziomy pas liderów, auto-scroll dla dalszych miejsc oraz poprawione liczenie remisów; ranking i wyniki końcowe sortują się teraz po `punkty -> łączny czas poprawnych odgadnięć -> alfabet`.
- Przy poprawnym werdykcie zapisuje się czas od startu timera prezentowania, verdict pokazuje badge czasu, a podsumowanie rundy pokazuje małe badge'e czasu tylko przy graczach, którzy punktowali w bieżącej rundzie.
- Weryfikacja przechodziła pakietowo przez całą sesję: wielokrotne `npm run build --workspace @party/charades`; część browser passów była robiona wcześniej, ale ostatni tie-breaker/time badge pass nie dostał jeszcze świeżego live smoke testu.
- Next: zrobić widoczny browser pass końcówki flow `timer -> verdict -> round summary -> results`, a potem wrócić do cleanupu dużych plików runtime/results bez dalszego rozszerzania scope.
- Experience recorded: yes

### S74 (23:59~) [Memory] Working-set cleanup without losing history

- Przejrzano warstwę `memory/*` pod kątem puchnięcia i ustalono, że `today.md` zostaje tygodniowym rolling logiem zamiast codziennej mikro-kompresji.
- `MEMORY.md` dostał szybki indeks tematyczny i zasadę `quick scan first`, żeby przy starcie sesji nie trzeba było czytać całego pliku liniowo.
- `goals.md` zsynchronizowano do obecnego stanu repo, a `memory/archive/README.md` ustawia jawną ścieżkę tygodniowej kompresji bez utraty historii.
- `AGENTS.md` i skill `session-end` doprecyzowują teraz, że `today.md` kompresujemy dopiero na granicy tygodnia, nie w środku aktywnego tygodnia pracy.
- Experience recorded: yes

### S73 (23:52~) [Repo docs/workflow] Agent-first documentation guardrails

- Dodano repo-level playbooki: `docs/README.md`, `docs/ui-map.md`, `docs/runtime-map.md`, `docs/game-module-template.md`, `docs/module-maturity.md`, `docs/shared-extraction-checklist.md` i `docs/code-organization.md`.
- Podpieto nowe dokumenty do `AGENTS.md`, `docs/agents.md`, `docs/task-routing.md`, `docs/new-game-checklist.md`, `rules/behaviors.md` oraz `PROJECT_CONTEXT.md`, tak aby byly realnie odkrywalne i uzywane podczas pracy.
- Zapisano jawne zasady `KISS` i `DRY` jako repo-level guardrails oraz doprecyzowano local-first bias dla runtime i shared extraction.
- Rozszerzono skill `session-end`, aby wymagac dokumentacyjnego sync passu po sesji i pilnowac, zeby docs nie zostawaly tydzien za kodem.
- Experience recorded: yes

### S72 (23:19~) [Kalambury] Presenter reveal word overflow fix

- Naprawiono overflow pojedynczych haseł na urządzeniu prezentera w Kalamburach przez bardziej konserwatywną heurystykę skalowania w `PresenterPhaseReveal`.
- Wyeksportowano helper sizingu i dodano focused regression check `presenter-reveal-word.check.cjs`, żeby szerokie słowa na wąskim telefonie nie wracały do zbyt dużego fontu.
- Weryfikacja przechodzi: `node packages/games/charades/src/runtime/presenter/presenter-reveal-word.check.cjs`, `node packages/games/charades/src/runtime/presenter/presenter-layout.check.cjs`, `node packages/games/charades/src/runtime/shared/autoscaled-word-layout.check.cjs`, `npm run build --workspace @party/charades`, `npm run build --workspace @party/hub`.
- Browser verify reveal screen nie był uczciwie domykalny na statycznym `:3001`, bo presenter nie przechodził z `waiting` do aktywnej fazy po sparowaniu; potraktowano to jako ograniczenie lokalnego stacku, nie jako dowód regresji.
- Experience recorded: no

### S71 (23:19~) [Repo docs/rules] Codex-only cleanup + true on-demand index

- Przepisano dokumentację repo pod model `Codex-only`: `AGENTS.md`, `docs/agents.md`, `docs/task-routing.md`, `rules/behaviors.md` i drobny wording w `docs/behaviors-extended.md`.
- `AGENTS.md` ma już prawdziwy `On-demand Loading Index` zgodny z realnym stanem repo, obejmujący zarówno `/docs`, jak i `/rules`.
- `docs/superpowers/specs/*` i `plans/*` zostały doprecyzowane jako aktywna historyczna referencja dla kontynuowanych obszarów, a nie martwe archiwum.
- Dodano reusable pattern do `memory/patterns.md` dla podziału dokumentacji na warstwy `mandatory / on-demand / active historical reference`.
- Experience recorded: yes

### S70 (13:02~) [Shared UI] Stage 3 controls settings overlay extraction

- Wyciągnięto wspólną infrastrukturę overlayu ustawień sterowania do `@party/ui`: `ControlsSettingsOverlay.tsx`, `useControlsSettingsOverlay.ts` i `types.ts`.
- `CharadesSettingsOverlay` i `CodenamesSettingsOverlay` zostały zredukowane do cienkich wrapperów, a game-local data, binding helpers i navigation targets zostały zostawione w swoich modułach.
- Zachowano dotychczasowe zachowanie: wake/sleep, controller wake guard, dialog ordering, parity lewo/prawo, listening binding flow, debug popup i focus-visible rules.
- Weryfikacja przechodzi: `npm run build --workspace @party/ui`, `npm run build --workspace @party/charades`, `npm run build --workspace @party/codenames`.
- Experience recorded: yes

### S69 (11:51~) [Tajniacy/Kalambury] Unified modal pass + Charades confirm parity

- Ujednolicono modalowe tokeny, hover states i theme propagation w shared UI oraz głównych modalach Tajniaków i Kalamburów, tak aby modale dziedziczyły kolor aktywnej gry zamiast fallbackowego akcentu.
- W Tajniakach dopracowano kolejność akcji i browserowy wygląd modali po refactorze, w tym pause confirm zgodnie z zasadą `złe po lewej / dobre po prawej`.
- W Kalamburach poprawiono ten sam runtime zgrzyt w pause confirm: układ przycisków, `host-controls` i runtime navigation profile zostały zgrane do nowej logiki `left/up -> exit`, `right/down -> stay`.
- Weryfikacja przechodzi: `npm run build --workspace @party/charades`, `npm run test:host-controls --workspace @party/charades`, `npm run test:navigation-profiles --workspace @party/charades`, `npm run build --workspace @party/hub`.
- Browser pass ujawnił ważne ograniczenia lokalnego stacku: `127.0.0.1:3000` daje fałszywie martwy HMR dla huba, `localhost:3000` działa poprawnie dla modali/setupu, a zalecany `dev-hub-dev.mjs` może zostać zablokowany przez obcy błąd typów w `apps/hub/src/app/auth/page.tsx`.
- Next: dokończyć pełny runtime browser pass Kalamburów, gdy lokalny stack (`localhost:3000` + PartyKit + auth-free build path) będzie stabilny end-to-end.
- Experience recorded: yes

### S68 (2026-04-20) [Tajniacy] Pelne sterowanie hosta klawiatura i kontrolerem

- Dowieziono pelny host-side flow sterowania Tajniakow klawiatura i kontrolerem od menu/setup/settings do runtime hosta.
- Dodano runtime layer dla inputu i mapowania komend: `runtime-input-state.ts`, `runtime-input-helpers.ts`, `host-controls.ts`, `useHostControls.ts`.
- Dodano runtime host-navigation profile dla Tajniakow wraz z runtime screen/zones/targets/command IDs oraz focused checks dla input-state, runtime profile i host-controls.
- `HostGameScreen` zostal wpiety w te same zapisane bindingi co menu/settings, dostal wake/sleep, board selection, modal focus i runtime status rail pod akcje `rail`.
- Poprawiono copy bindingu `rail` na prawdziwy panel statusu zamiast mylacego `rail / ranking`.
- Dodano browserowy smoke test `apps/hub/e2e/codenames-host-controls.spec.ts`, ktory przechodzi na pelnym lokalnym stacku z PartyKit i dwiema stronami kapitanow.
- Weryfikacja przechodzi: `npm run build --workspace @party/codenames`, `npm run lint --workspace @party/hub`, `runtime-input-state.check.cjs`, `codenames-runtime-navigation-profile.check.cjs`, `host-controls.check.cjs`, headed Playwright dla `codenames-host-controls.spec.ts`.
- Experience recorded: no

### S67 (2026-04-19) [Tajniacy/Kalambury] Pass po copy quality

- Zrobiono osobny pass po stringach UI w Tajniakach i Kalamburach pod brakujace polskie znaki i oczywiste literowki, po wczesniejszym potwierdzeniu, ze UTF-8 jest poprawny.
- Poprawiono ewidentne problemy copy w ekranie wyboru kapitana, runtime statusach i modalach Tajniakow, ustawieniach obu gier, sekcji kategorii/puli oraz formularzu dodawania gracza w Kalamburach.
- Po poprawkach odpalono ponowny skan kontrolny; nie zostaly oczywiste ASCII-only bledy w dotknietych plikach, a ostatnie trafienie bylo falszywym alarmem na poprawnym slowie `Potwierdzenie`.
- Experience recorded: no

### S66 (2026-04-19) [Tajniacy/Kalambury] Pelny pass UTF-8

- Przeskanowano 237 plikow tekstowych powiazanych z Tajniakami i Kalamburami: `content`, `packages/games`, `packages/partykit` oraz powiazane pliki w `apps/hub`.
- Sprawdzono jednoczesnie poprawnosc bajtow UTF-8 oraz brak klasycznych markerow mojibake i znaku zastepczego Unicode.
- Wynik: brak wykrytych uszkodzen UTF-8 i brak mojibake w skanowanych plikach obu gier.
- Experience recorded: no

### S65 (2026-04-19) [Repo/Agents] Prefer `pwsh` 7.6 for shell work

- Dodano do `AGENTS.md` jawną regułę, żeby na Windows preferować `pwsh` (PowerShell 7.6+) zamiast Windows PowerShell 5.1.
- Reguła jest szczególnie skierowana pod odczyt i weryfikację UTF-8-sensitive polskich treści, gdzie `pwsh` renderuje poprawnie, a `5.1` potrafi pokazać mojibake.
- Experience recorded: yes

### S64 (2026-04-19) [Tajniacy] Rozbudowa bazy haseł do 100

- Rozszerzono bazę słów Tajniaków w `content/codenames/`: `standard` z 30 do 100 haseł i `plus18` z 30 do 100 haseł.
- Zmieniono wyłącznie listy treści, bez ruszania logiki setupu, walidacji ani runtime.
- Zweryfikowano zapis UTF-8 po edycji oraz liczność i unikalność: 200 haseł łącznie, bez duplikatów między kategoriami.
- Experience recorded: no

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

# Today - 2026-04-20

### S88 (2026-04-25) [Tajniacy] Host setup flicker investigation around captain link flow

- Po fixie avatar pickera zrobiono wąski pass pod zgłoszony runtime/UI bug: wejście w link kapitana z modalu parowania potrafi na chwilę wybić hosta z setupu do menu głównego.
- Hardening po stronie hosta obejmuje utrzymanie stanu setupu w URL `?setup=1`, usunięcie podwójnego `window.open()` w akcji otwierania linku oraz przeniesienie przywracania setupu przed paint przez osobny `CodenamesMenuPageClient`.
- Lokalny browser pass na `http://localhost:3000` nie odtworzył błędu: host zostawał na `/games/codenames/?setup=1`, modal setupu pozostawał otwarty podczas `otwórz w nowej karcie` i wejścia na `/captain/...`.
- Status po sesji jest uczciwie mieszany: kod został utwardzony, ale raportowany flicker nadal nie ma potwierdzonego root cause w lokalnym odtworzeniu, więc nie można go uznać za zamknięty.
- Weryfikacja przechodzi: `npm run build --workspace @party/codenames` oraz `npm run build --workspace @party/hub`.
- Next: dołożyć krótkie dev-logowanie zmian `showSetup`, remountu i focus/visibility hosta dokładnie wokół flow `modal parowania -> link kapitana`, żeby złapać realny trigger na maszynie użytkownika albo w bardziej wiernym local passie.
- Experience recorded: no

### S89 (13:06~) [Hub/Content] Browser chrome polish + landing cleanup

- Aktywowano live hero Tajniaków i animowaną kartę Spyfall w bibliotece huba, a ze strony głównej usunięto zbędny blok społeczności/showcase.
- Hub dostał finalny pass po chrome przeglądarki: tytuły kart są teraz ustawiane przez server metadata (`Project Party`, `Project Party - Gry`, `Project Party - Kalambury`, `Project Party - Tajniacy`), layouty gier zostały rozdzielone na server wrapper z metadata i client shell z logiką sterowania, a root dostał prawdziwe `apps/hub/public/favicon.ico`.
- Dopięto też polish copy w footerze huba: nowy opis platformy i rok `2026`.
- W tym samym bloku odświeżono też content gry: wyczyszczono/przesortowano pulę `content/charades/random.ts` oraz rozbudowano i doszlifowano pule `content/codenames/standard.ts` i `content/codenames/plus18.ts` do docelowego stanu `300 / 350` bez duplikatów między kategoriami.
- Weryfikacja przechodzi: wielokrotne `npm run build --workspace @party/hub` oraz live check na `http://localhost:3000` dla tytułów i faviconów huba, katalogu, Kalamburów i Tajniaków.
- Next: jeśli wróci zgłoszenie o flickerze setupu Tajniaków przy linku kapitana, wrócić do niego tylko przez wąską instrumentację `showSetup` / remount / focus, bez kolejnych ślepych patchy.
- Experience recorded: yes

### S90 (2026-04-25) [Tajniacy/Kalambury] Pairing flow hardening around setup/modal remounts

- Zamiast kolejnych punktowych fixów zrobiono pełny przegląd lifecycle parowania w obu grach: host setup, modal parowania, listener websocket i flow `otwórz w nowej karcie -> dołączenie urządzenia`.
- Root cause okazał się wspólny dla Tajniaków i Kalamburów: stan `showSetup` i stan modala parowania były rozdzielone po lokalnych `useState`, a zapis do URL następował dopiero w efekcie po renderze. Jeśli w tym oknie następował remount, host tracił setup albo sam modal.
- Fix przenosi oba stany na poziom strony i traktuje URL jako trwały nośnik UI state: `?setup=1` dla setupu i `?pairing=1` dla modala parowania. Aktualizacja URL dzieje się synchronicznie w tych samych handlerach, które otwierają lub zamykają overlay, więc znika wyścig między kliknięciem a remountem.
- Panele parowania w obu grach przestały trzymać własny `showModal`; są teraz sterowane propsami z poziomu strony, więc remount nie gasi już modala.
- Weryfikacja jest zielona: `npm run build --workspace @party/charades`, `npm run build --workspace @party/codenames`, `npm run build --workspace @party/hub`.
- Browser pass przeszedł dla obu flow host + urządzenie:
- Kalambury: po `Dodaj urządzenia -> Otwórz w nowej karcie` host pozostał na `?setup=1&pairing=1`, modal został otwarty, a po wejściu prezentera status zmienił się na `Połączono` bez zamknięcia modala.
- Tajniacy: po `Dodaj urządzenia -> Otwórz w nowej karcie -> wybór drużyny` host pozostał na `?setup=1&pairing=1`, setup i modal nie zniknęły, a status kapitana zaktualizował się w otwartym modalu.
- Artefakt browser verify zapisano w `output/playwright/codenames-pairing-retained.png`.
- Experience recorded: yes

### S87 (2026-04-24) [Tajniacy] Avatar picker sync with Kalambury

- Pierwszy fix był niepełny: niesłusznie usunięto zakładkę `Inne`, a sam bug renderu popupu nadal występował.
- Root cause okazał się po stronie layoutu pickera w Tajniakach: ten konkretny popup źle renderował avatary w `CSS grid`, mimo poprawnych wymiarów DOM, i dawał pionowe „taśmy” emoji zamiast kafli.
- Finalny fix przełączył listę avatarów na prosty `flex-wrap` z jawnym basisem 4 kolumn desktop / 3 kolumn mobile; dzięki temu popup znów renderuje poprawnie dla `Ludzie`, `Zwierzeta` i `Inne`.
- Zakładka `Inne` została przywrócona; synchronizacja z Kalamburami została ograniczona do zachowania i wyglądu zakładek `Ludzie` / `Zwierzeta`, bez kasowania trzeciej kategorii.
- Weryfikacja przechodzi: `npm run build --workspace @party/codenames`, `npm run build --workspace @party/hub`, plus lokalny browser pass ze screenshotami popupu przed i po fixie.
- Experience recorded: no

### S85 (2026-04-24) [Tajniacy] Host exit now returns captains to waiting before invalidating stale session

- Naprawiono flow host-kapitan w Tajniakach tak, żeby zwykły powrót hosta do menu nie wyrzucał urządzenia kapitana od razu do menu głównego.
- Host runtime przy wyjściu do menu wysyła teraz najpierw `GAME_RESET`, a dopiero potem nawiguje do `/games/codenames`, dzięki czemu kapitan wraca do stanu `waiting` z loaderem i copy `Czekam na start gry...`.
- Hooki kapitana przestały traktować każdy `HOST_DISCONNECTED` jako natychmiastowy hard-exit; dostały grace window `5s` na powrót hosta do tego samego pokoju.
- Jeśli host nie wróci do starego pokoju w tym oknie, ekran kapitana pokazuje komunikat o zakończeniu poprzedniej sesji i wraca do menu głównego, co przykrywa przypadek zmiany kodu sesji / porzucenia starego pokoju.
- Przy okazji dopięto obsługę `HOST_SETUP_CONNECTED` po stronie hooków kapitana, żeby powrót hosta do setupu tego samego pokoju od razu kasował stan rozłączenia.
- Po zgłoszeniu, że urządzenie nadal wraca do menu mimo tego samego kodu, zdebugowano prawdziwą przyczynę: `CaptainListener` w menu Tajniaków był montowany tylko wewnątrz otwartego setupu, więc po wyjściu hosta z `/play` i zamkniętym setupie pokój wyglądał dla kapitana jak porzucony.
- Fix root cause: listener parowania został przeniesiony na poziom całej strony `/games/codenames` i pozostaje aktywny zawsze, gdy lokalny setup został odtworzony i istnieje `roomId`, niezależnie od tego, czy modal setupu jest otwarty.
- Weryfikacja przechodzi: `npm run build --workspace @party/codenames`, `npm run test:authority:codenames --workspace @party/partykit`.
- Dodatkowa weryfikacja po root-cause fixie też przechodzi: focused helper check dla aktywacji listenera oraz `npm run build --workspace @party/hub`.
- Browser verify dla tego konkretnego flow nie został jeszcze odpalony w tej sesji.
- Experience recorded: no

### S86 (2026-04-24) [Tajniacy] Review follow-up for reset handoff and validation reuse

- Domknięto trzy follow-upy z review Task 6 bez rozszerzania scope poza ownership wskazany w zadaniu.
- Hostowy `exitToMenu()` nie opiera się już na arbitralnym timeoutcie: ekran wysyła `GAME_RESET`, czeka na świeżo zaobserwowany reset z pokoju i dopiero wtedy nawiguje z `/games/codenames/play` do menu, więc unmount nie ścina już eventu po drodze.
- `useHostGame` przestał trzymać stare `categoryBalance` w domknięciach start/reset flow; balans czytany jest teraz z refa tak samo jak kategorie i teamy.
- Strona `apps/hub/.../codenames/page.tsx` nie duplikuje już logiki walidacji zbalansowanej puli; korzysta z istniejącego helpera wyeksportowanego z `@party/codenames`.
- Weryfikacja przechodzi: `npm run build --workspace @party/codenames`, `npm run build --workspace @party/hub`.
- Browser verify tego konkretnego review follow-upu nie był odpalany.
- Experience recorded: no

### S84 (2026-04-24) [Kalambury] Runtime remediation executed and verified

- Domknięto execution-ready plan z `docs/superpowers/plans/2026-04-23-charades-runtime-audit-remediation.md` zamiast kolejnego passu „na oko”: odchudzono `HostGameScreen`, ujednolicono presenter-state z PartyKit `GAME_RESET`, a `PlayBoardPhases` rozbito na lokalne widoki.
- W trakcie passa naprawiono też dwa prawdziwe regresy testowe wokół aktualnego zachowania runtime: przestarzały `host-controls.check.cjs` dla ścieżki `Nie zgadnięto` oraz stale Playwright selektory po przywróceniu polskich znaków w copy prezentera i pickera werdyktu.
- Finalna weryfikacja jest zielona: `npm run test:verdict-picker-layout --workspace @party/charades`, `npm run test:host-controls --workspace @party/charades`, `npm run test:authority --workspace @party/partykit`, `npm run build --workspace @party/charades`, `npm run build --workspace @party/hub`, `npx playwright test apps/hub/e2e/charades-runtime-flow.spec.ts --project=chromium`.
- Browser spec przechodzi end-to-end dla obu scenariuszy: pełny mixed-verdict flow `4 players / 3 rounds` oraz zachowanie sparowania prezentera po wyjściu hosta do menu.
- Task `T001` można zamknąć; dla Kalamburów nie został aktywny blocker po tym passie.
- Experience recorded: no

### S83 (2026-04-23) [Kalambury] Runtime remediation plan refreshed to match repo state

- Przepisano `docs/superpowers/plans/2026-04-23-charades-runtime-audit-remediation.md` z wersji „od zera” na plan kontynuacyjny gotowy do wykonania od bieżącego stanu repo.
- Plan oznacza teraz jawnie, co już jest domknięte (`verdict-picker-layout` guard, authority reset guard, zielony Playwright mixed-verdict flow, wydzielone `useHostVerdictFlow`) i usuwa martwe kroki, które kazałyby robić to samo drugi raz.
- Remaining work został rozpisany wprost pod obecny kod: dokończenie splitu `HostGameScreen`, ujednolicenie stanu prezentera i `GAME_RESET`, rozbicie `PlayBoardPhases` na lokalne widoki oraz finalny sync `PROJECT_CONTEXT.md` / `memory/*`.
- W planie poprawiono też lokalną ścieżkę browser verify na `http://localhost:3000`, zgodnie z aktualnym pitfallem HMR huba.
- Experience recorded: no

### S82 (2026-04-23) [Kalambury] Mixed-verdict browser flow closed + HostGameScreen verdict split

- Domknięto realny browser blocker w `apps/hub/e2e/charades-runtime-flow.spec.ts`, ale nie przez dalsze „leczenie” runtime'u w ciemno, tylko przez poprawienie błędnych założeń testu względem prawdziwego flow rund.
- Spec rozróżnia teraz przejście `prepare -> next presenter` od prawdziwego `round-summary -> Następna runda`, zamiast oczekiwać `Następna runda` po każdej turze.
- Dodatkowo ustabilizowano multi-page Playwright flow dla hosta i prezentera: po interakcjach na telefonie test przywraca fokus hostowi przed czekaniem na `STOP`, a przy starcie nowej rundy trzyma aktywnego hosta aż round-order dojdzie do `prepare`. To usuwało headed-throttling po stronie aktywnego tab-a.
- Weryfikacja browserowa jest zielona: `npx playwright test apps/hub/e2e/charades-runtime-flow.spec.ts --project=chromium` przechodzi dla obu scenariuszy (`4 players / 3 rounds` mixed verdict oraz presenter pairing po wyjściu hosta do menu).
- Po zamknięciu browser blockera zrobiono pierwszy bezpieczny refactor `HostGameScreen`: verdict/round-summary flow został wydzielony do lokalnego `useHostVerdictFlow.ts`, zgodnie z `docs/code-organization.md`, bez rozbijania całego ekranu na puste wrappery.
- Buildy po tym passie przechodzą: `npm run build --workspace @party/charades` i `npm run build --workspace @party/hub`.
- Next: wyciągnąć drugą sensowną granicę z `HostGameScreen` (`host runtime controls`), a potem wrócić do tasków `usePresenter` / PartyKit reset flow z planu audytowego.
- Experience recorded: no

### S81 (2026-04-23) [Kalambury] Audit remediation paused mid mixed-verdict browser pass

- Uruchomiono plan naprawczy z `docs/superpowers/plans/2026-04-23-charades-runtime-audit-remediation.md` w trybie subagent-driven i domknięto pierwszy check-first pass wokół modala poprawnego werdyktu.
- Dodano focused guards: `packages/games/charades/src/runtime/play/verdict-picker-layout.check.cjs` oraz doprecyzowany authority regression pass w `packages/partykit/charades/server.authority.check.cjs`; oba przechodzą razem z `npm run test:verdict-picker-layout --workspace @party/charades` i `npm run test:authority --workspace @party/partykit`.
- Dodano browserowy spec `apps/hub/e2e/charades-runtime-flow.spec.ts` z dwoma scenariuszami: pełny mixed-verdict flow `4 players / 3 rounds` oraz zachowanie sparowania urządzenia po powrocie hosta do menu.
- Scenariusz pairing-retention jest zielony w Chromium; mixed-verdict flow nadal nie jest domknięty, ale failure point przesunął się dalej niż wcześniejszy blocker pickera.
- W runtime naprawiono realny problem pointer events w pickerze poprawnego werdyktu: wybór gracza i akcje footerowe (`Wróć`, `Przyznaj punkt`) reagują teraz na primary `pointerdown`, a `click` został zostawiony jako fallback dla klawiatury.
- Po tych poprawkach browser flow przechodzi przez dawny moment z zawieszonym modalem, ale nadal zatrzymuje się później: headed Playwright timeoutuje na oczekiwaniu na `Następna runda`, gdy host jest już po correct-verdict path.
- Sesję zatrzymano celowo w tym miejscu bez dalszego grzebania w logice, żeby kontynuacja mogła wystartować dokładnie od śladu browser passa, a nie od ponownego odtwarzania całego kontekstu.
- Experience recorded: no

### S79 (2026-04-23) [Kalambury] Browser pass + host exit reset for presenter

- Zrobiono uczciwy browser pass host + urządzenie prezentera na lokalnym stacku `localhost:3000` + PartyKit `localhost:1999`, z zasianym runtime configiem i dwoma kartami przeglądarki.
- Pass najpierw odtworzył zgłoszony błąd: host wracał do menu Kalamburów, ale urządzenie prezentera zostawało na ekranie `Twoja kolej na scene`.
- Przyczyna była po stronie host runtime, nie UI: wyjście do menu robiło `router.push('/games/charades')`, ale nie wysyłało `GAME_RESET` do pokoju.
- Dodano jawny `resetGame()` w `useGameState` i spięto go z wyjściem hosta do menu w `apps/hub/src/app/games/charades/play/page.tsx`, także dla browserowego confirm alertu.
- Powtórzony browser pass przeszedł: po `Ustawienia -> Powrót do menu -> Tak, wróć do menu` host wraca na `/games/charades/`, a telefon pokazuje `Host wrócił do menu głównego`.
- Dopięto też zachowanie setupu po powrocie do menu: reset pokoju nie zrywa już sztucznie flagi `presenterConnected` na serwerze, jeśli websocket prezentera nadal żyje. W zweryfikowanym flow z zachowanym setupem i tym samym `roomId` host po wejściu z powrotem do setupu widzi `Połączono` zamiast ponownego parowania.
- Artefakty browser passa zapisano w `output/playwright/charades-presenter-*.png`.
- Weryfikacja przechodzi: `npm run build --workspace @party/charades`, `npm run build --workspace @party/hub`, plus lokalny Playwright browser pass.
- Experience recorded: no

### S80 (2026-04-23) [Kalambury] Full browser pass for 4 players / 3 rounds

- Zrobiono długi browser pass na lokalnym stacku dla Kalamburów z 4 graczami i 3 rundami, prowadząc hosta i urządzenie prezentera przez pełny przebieg do wyników.
- Uczciwie potwierdzono pełny flow `waiting -> round-order -> your-turn -> reveal-buffer -> timer -> verdict -> round-summary -> results` na wariancie wszystkich werdyktów `Nie zgadnięto`; pass doszedł do `Wyniki kalamburów`.
- W trakcie passa wyszedł osobny blocker dla poprawnego werdyktu: modal `Który gracz odgadł hasło?` potrafi obciąć akcje na dole (`Przyznaj punkt`) przy desktopowym viewportcie hosta, więc poprawny werdykt nie dostał jeszcze pełnego zielonego end-to-end passa.
- Dla tego modala zrobiono wąski CSS fix w `HostGameScreen.module.css` (mniejsze gapy i niższe karty dla density `grid-4`), ale nie wystarczył on jeszcze do pełnego domknięcia wariantu `Zgadnięto`.
- Artefakty passa zapisano w `output/playwright/charades-all-incorrect-*.png` oraz wcześniejszych `charades-full-pass-*.png`.
- Weryfikacja przechodzi: `npm run build --workspace @party/charades`, `npm run build --workspace @party/hub`, plus lokalny browser pass 4 players / 3 rounds do wyników dla ścieżki all-incorrect.
- Next: zrobić osobny, wąski fix widoczności / dostępności akcji `Przyznaj punkt` w pickerze poprawnego werdyktu i powtórzyć pełny mixed-verdict pass.
- Experience recorded: no

### S76 (2026-04-23) [Kalambury] Verdict copy tighten-up

- Zrobiono bardzo wąski pass copy dla ekranu werdyktu w Kalamburach, bez ruszania layoutu i logiki runtime.
- Nagłówek skrócono z `Czy hasło zostało odgadnięte?` do `Hasło odgadnięte?`, a badge czasu zmieniono na czytelniejsze `Czas odpowiedzi: {czas}`.
- Dla śladu decyzji zapisano mały spec w `docs/superpowers/specs/2026-04-23-charades-verdict-copy-design.md`.
- Weryfikacja przechodzi: `npm run build --workspace @party/charades`.
- Browser verify nie był odpalany w tym małym passie copy.
- Experience recorded: no

### S77 (2026-04-23) [Kalambury] Verdict reveal button weight pass

- Zrobiono osobny, bardzo wąski pass wizualny dla przycisku `Pokaż hasło` na ekranie werdyktu hosta.
- Ciężkie koło zostało odchudzone do lżejszego capsule buttona: mniejsza gęstość, delikatniejsza ramka, słabszy cień i subtelniejszy stan aktywny, bez zmiany zachowania ani położenia.
- Dla śladu decyzji zapisano mikro-spec w `docs/superpowers/specs/2026-04-23-charades-verdict-button-weight-design.md`.
- Weryfikacja przechodzi: `npm run build --workspace @party/charades`.
- Browser verify nie był odpalany w tym małym passie wizualnym.
- Experience recorded: no

### S78 (2026-04-23) [Kalambury] Presenter status sync with host flow

- Dopięto bardziej prawdziwy sync statusów telefonu prezentera względem hosta zamiast kolejnego passu po wyglądzie.
- Telefon pokazuje teraz wyraźne `Oczekiwanie na rozpoczęcie przez hosta`, gdy urządzenie jest sparowane, ale host nie wystartował jeszcze rundy.
- Dodano nowy event/stage `ROUND_ORDER_START`, żeby presenter dostał osobny stan `Losowana jest kolejność` podczas hostowego losowania kolejności zarówno na starcie gry, jak i po podsumowaniu rundy.
- Zmiany objęły wspólne eventy runtime, hook hosta `useGameState`, hook prezentera `usePresenter`, presenter UI oraz PartyKit authority server dla Kalamburów.
- Weryfikacja przechodzi: `npm run build --workspace @party/charades`, `npm run test:authority --workspace @party/partykit`.
- Browser verify nie był jeszcze odpalany dla tego sync passu.
- Experience recorded: no

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

# Today - 2026-04-14

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

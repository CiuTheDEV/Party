# `@party/ui`

Wspólna biblioteka UI dla Project Party.

Ta paczka trzyma wyłącznie współdzielone klocki prezentacyjne i layouty. Nie powinna znać zasad konkretnej gry, nazw akcji, logiki runtime ani danych domenowych.

## Zakres odpowiedzialności

`@party/ui` odpowiada za:
- shell aplikacji i nawigację,
- wspólne layouty menu i setupu,
- współdzielone primitive'y formularzy i settingsów,
- modalowe primitive'y platformy,
- wspólne elementy runtime, jeśli są neutralne względem gry,
- wspólne assety avatarów i helpery do ich użycia.

`@party/ui` nie powinno trzymać:
- logiki gry,
- danych konkretnej gry,
- konfiguracji kategorii, rund, bindów, promptów itp.,
- logiki zapisu ustawień do `localStorage` / sesji / backendu,
- mapowania akcji specyficznych dla jednej gry.

## Aktualny zestaw komponentów

### Shell i platforma

- `Topbar`
- `GameSidebar`
- `GameShell`
- `GameCard`
- `GameIcon`
- `PremiumModal`

### Setup i formularze

- `GameSetupTemplate`
- `DiscreteSlider`
- `SwitchField`
- `SegmentedChoice`
- `GameSettingsModalShell`
- `GameSettingsTabs`
- `GameSettingsSection`
- `GameSettingsCard`

### Runtime

- `RuntimeTopBar`

### Avatary

- `AvatarAsset`
- helpery i rejestr w `src/avatars/*`

### Shared settings UI

Te komponenty budują wspólną ramę ekranów ustawień gier:

- `AlertDialog`
  - wspólny alert / potwierdzenie dla akcji typu zapis, reset, wyjście
- `SettingsPanelShell`
  - główna rama ekranu ustawień: header, tabs, układ `lista + panel boczny`
- `SettingsPanelFooter`
  - dolna belka z metą i akcjami
- `SettingsPanelTabs`
  - górne zakładki ekranu ustawień
- `SettingsStatusPill`
  - status typu `Niezapisane zmiany`
- `SettingsPlaceholderCard`
  - karta dla sekcji jeszcze niezaimplementowanych
- `SettingsListHeader`
  - nagłówek lewej kolumny / listy ustawień
- `SettingsDetailHero`
  - hero prawego panelu: ikona, label, tytuł

## Zasada użycia przy nowej grze

Przy nowym module gry:
- bierz z `@party/ui` ramę i primitive'y,
- lokalnie w grze definiuj dane, logikę i konkretne sekcje.

Przykład:
- shared: shell ustawień, zakładki, footer, alerty
- lokalnie: lista opcji gry, wartości domyślne, walidacja, zapis, logika sterowania

## Granica między shared i local

Dobra kandydatura do `@party/ui`:
- coś wygląda tak samo w kilku grach,
- nie wymaga wiedzy o konkretnej grze,
- jest głównie layoutem albo presentation primitive.

Zła kandydatura do `@party/ui`:
- komponent zna nazwy akcji typu `left / right / confirm`,
- komponent zakłada konkretny model danych jednej gry,
- komponent zawiera logikę runtime lub biznesową.

import { Gamepad2, Monitor, Sparkles, Volume2, Waves } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type CharadesSettingsCategoryId = 'general' | 'audio' | 'controls'
export type CharadesControlsDevice = 'keyboard' | 'controller'

export type CharadesControlsBinding = {
  id: string
  title: string
  description: string
  device: CharadesControlsDevice
  section: string
  inputLabel: string
}

export type CharadesSettingsCategory = {
  id: CharadesSettingsCategoryId
  label: string
  icon: LucideIcon
  description: string
  bindings?: CharadesControlsBinding[]
}

export const charadesSettingsCategories: CharadesSettingsCategory[] = [
  {
    id: 'general',
    label: 'Ogolne',
    icon: Monitor,
    description: 'Sekcja ogolnych preferencji jest przygotowana pod przyszle ustawienia produktu.',
  },
  {
    id: 'audio',
    label: 'Dzwiek',
    icon: Volume2,
    description: 'Sekcja dzwieku pozostaje przygotowana pod pozniejsze ustawienia audio i miksu.',
  },
  {
    id: 'controls',
    label: 'Sterowanie',
    icon: Gamepad2,
    description: 'Lokalne przypisywanie klawiszy klawiatury i kontrolera.',
    bindings: [
      {
        id: 'keyboard-left',
        title: 'Lewo',
        description: 'Przesuwa fokus interfejsu albo wybor o jedna pozycje w lewo.',
        device: 'keyboard',
        section: 'Klawiatura',
        inputLabel: 'A',
      },
      {
        id: 'keyboard-right',
        title: 'Prawo',
        description: 'Przesuwa fokus interfejsu albo wybor o jedna pozycje w prawo.',
        device: 'keyboard',
        section: 'Klawiatura',
        inputLabel: 'D',
      },
      {
        id: 'keyboard-up',
        title: 'Gora',
        description: 'Przesuwa fokus interfejsu albo wybor o jedna pozycje w gore.',
        device: 'keyboard',
        section: 'Klawiatura',
        inputLabel: 'W',
      },
      {
        id: 'keyboard-down',
        title: 'Dol',
        description: 'Przesuwa fokus interfejsu albo wybor o jedna pozycje w dol.',
        device: 'keyboard',
        section: 'Klawiatura',
        inputLabel: 'S',
      },
      {
        id: 'keyboard-confirm',
        title: 'Potwierdz',
        description: 'Uruchamia glowna zaznaczona akcje i akceptuje wybor.',
        device: 'keyboard',
        section: 'Klawiatura',
        inputLabel: 'Enter',
      },
      {
        id: 'keyboard-back',
        title: 'Wstecz',
        description: 'Wraca do poprzedniego kroku albo zamyka aktywny panel.',
        device: 'keyboard',
        section: 'Klawiatura',
        inputLabel: 'Esc',
      },
      {
        id: 'keyboard-menu',
        title: 'Ustawienia / pauza',
        description: 'Otwiera ustawienia gry lub menu pauzy w zaleznosci od ekranu.',
        device: 'keyboard',
        section: 'Klawiatura',
        inputLabel: 'Tab',
      },
      {
        id: 'keyboard-primary',
        title: 'Akcja glowna',
        description: 'Wykonuje najwazniejsza akcje kontekstowa, na przyklad start rundy albo odkrycie hasla.',
        device: 'keyboard',
        section: 'Klawiatura',
        inputLabel: 'Space',
      },
      {
        id: 'keyboard-secondary',
        title: 'Akcja alternatywna',
        description: 'Uruchamia druga akcje kontekstowa, gdy ekran ma dwa rownorzedne wybory.',
        device: 'keyboard',
        section: 'Klawiatura',
        inputLabel: 'Q',
      },
      {
        id: 'keyboard-rail',
        title: 'Przelacz rail / ranking',
        description: 'Zwija lub rozwija rail i aktualny ranking bez opuszczania ekranu gry.',
        device: 'keyboard',
        section: 'Klawiatura',
        inputLabel: 'R',
      },
      {
        id: 'controller-left',
        title: 'Lewo',
        description: 'Przesuwa fokus interfejsu albo wybor o jedna pozycje w lewo.',
        device: 'controller',
        section: 'Kontroler',
        inputLabel: 'D-Pad Left',
      },
      {
        id: 'controller-right',
        title: 'Prawo',
        description: 'Przesuwa fokus interfejsu albo wybor o jedna pozycje w prawo.',
        device: 'controller',
        section: 'Kontroler',
        inputLabel: 'D-Pad Right',
      },
      {
        id: 'controller-up',
        title: 'Gora',
        description: 'Przesuwa fokus interfejsu albo wybor o jedna pozycje w gore.',
        device: 'controller',
        section: 'Kontroler',
        inputLabel: 'D-Pad Up',
      },
      {
        id: 'controller-down',
        title: 'Dol',
        description: 'Przesuwa fokus interfejsu albo wybor o jedna pozycje w dol.',
        device: 'controller',
        section: 'Kontroler',
        inputLabel: 'D-Pad Down',
      },
      {
        id: 'controller-confirm',
        title: 'Potwierdz',
        description: 'Uruchamia glowna zaznaczona akcje i akceptuje wybor.',
        device: 'controller',
        section: 'Kontroler',
        inputLabel: 'A / Cross',
      },
      {
        id: 'controller-back',
        title: 'Wstecz',
        description: 'Wraca do poprzedniego kroku albo zamyka aktywny panel.',
        device: 'controller',
        section: 'Kontroler',
        inputLabel: 'B / Circle',
      },
      {
        id: 'controller-menu',
        title: 'Ustawienia / pauza',
        description: 'Otwiera ustawienia gry lub menu pauzy w zaleznosci od ekranu.',
        device: 'controller',
        section: 'Kontroler',
        inputLabel: 'Start',
      },
      {
        id: 'controller-primary',
        title: 'Akcja glowna',
        description: 'Wykonuje najwazniejsza akcje kontekstowa, na przyklad start rundy albo odkrycie hasla.',
        device: 'controller',
        section: 'Kontroler',
        inputLabel: 'R1 / RB',
      },
      {
        id: 'controller-secondary',
        title: 'Akcja alternatywna',
        description: 'Uruchamia druga akcje kontekstowa, gdy ekran ma dwa rownorzedne wybory.',
        device: 'controller',
        section: 'Kontroler',
        inputLabel: 'L1 / LB',
      },
      {
        id: 'controller-rail',
        title: 'Przelacz rail / ranking',
        description: 'Zwija lub rozwija rail i aktualny ranking bez opuszczania ekranu gry.',
        device: 'controller',
        section: 'Kontroler',
        inputLabel: 'Y / Triangle',
      },
    ],
  },
]

export function createCharadesControlsBindingsState() {
  return Object.fromEntries(
    charadesSettingsCategories.flatMap((category) =>
      (category.bindings ?? []).map((binding) => [binding.id, binding.inputLabel]),
    ),
  ) as Record<string, string>
}

export const charadesSettingsAccentIcons = {
  general: Sparkles,
  audio: Waves,
  controls: Gamepad2,
}

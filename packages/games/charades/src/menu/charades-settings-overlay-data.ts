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
  primaryInputLabel: string
  secondaryInputLabel?: string
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
        primaryInputLabel: 'A',
        secondaryInputLabel: 'Arrow Left',
      },
      {
        id: 'keyboard-right',
        title: 'Prawo',
        description: 'Przesuwa fokus interfejsu albo wybor o jedna pozycje w prawo.',
        device: 'keyboard',
        section: 'Klawiatura',
        primaryInputLabel: 'D',
        secondaryInputLabel: 'Arrow Right',
      },
      {
        id: 'keyboard-up',
        title: 'Gora',
        description: 'Przesuwa fokus interfejsu albo wybor o jedna pozycje w gore.',
        device: 'keyboard',
        section: 'Klawiatura',
        primaryInputLabel: 'W',
        secondaryInputLabel: 'Arrow Up',
      },
      {
        id: 'keyboard-down',
        title: 'Dol',
        description: 'Przesuwa fokus interfejsu albo wybor o jedna pozycje w dol.',
        device: 'keyboard',
        section: 'Klawiatura',
        primaryInputLabel: 'S',
        secondaryInputLabel: 'Arrow Down',
      },
      {
        id: 'keyboard-confirm',
        title: 'Potwierdz',
        description: 'Uruchamia glowna zaznaczona akcje i akceptuje wybor.',
        device: 'keyboard',
        section: 'Klawiatura',
        primaryInputLabel: 'Enter',
      },
      {
        id: 'keyboard-back',
        title: 'Wstecz',
        description: 'Wraca do poprzedniego kroku albo zamyka aktywny panel.',
        device: 'keyboard',
        section: 'Klawiatura',
        primaryInputLabel: 'Esc',
      },
      {
        id: 'keyboard-menu',
        title: 'Ustawienia / pauza',
        description: 'Otwiera ustawienia gry lub menu pauzy w zaleznosci od ekranu.',
        device: 'keyboard',
        section: 'Klawiatura',
        primaryInputLabel: 'Tab',
      },
      {
        id: 'keyboard-primary',
        title: 'Akcja glowna',
        description: 'Wykonuje najwazniejsza akcje kontekstowa, na przyklad start rundy albo odkrycie hasla.',
        device: 'keyboard',
        section: 'Klawiatura',
        primaryInputLabel: 'Space',
      },
      {
        id: 'keyboard-secondary',
        title: 'Akcja alternatywna',
        description: 'Uruchamia druga akcje kontekstowa, gdy ekran ma dwa rownorzedne wybory.',
        device: 'keyboard',
        section: 'Klawiatura',
        primaryInputLabel: 'Q',
      },
      {
        id: 'keyboard-rail',
        title: 'Przelacz rail / ranking',
        description: 'Zwija lub rozwija rail i aktualny ranking bez opuszczania ekranu gry.',
        device: 'keyboard',
        section: 'Klawiatura',
        primaryInputLabel: 'R',
      },
      {
        id: 'controller-left',
        title: 'Lewo',
        description: 'Przesuwa fokus interfejsu albo wybor o jedna pozycje w lewo.',
        device: 'controller',
        section: 'Kontroler',
        primaryInputLabel: 'D-Pad Left',
        secondaryInputLabel: 'L Stick Left',
      },
      {
        id: 'controller-right',
        title: 'Prawo',
        description: 'Przesuwa fokus interfejsu albo wybor o jedna pozycje w prawo.',
        device: 'controller',
        section: 'Kontroler',
        primaryInputLabel: 'D-Pad Right',
        secondaryInputLabel: 'L Stick Right',
      },
      {
        id: 'controller-up',
        title: 'Gora',
        description: 'Przesuwa fokus interfejsu albo wybor o jedna pozycje w gore.',
        device: 'controller',
        section: 'Kontroler',
        primaryInputLabel: 'D-Pad Up',
        secondaryInputLabel: 'L Stick Up',
      },
      {
        id: 'controller-down',
        title: 'Dol',
        description: 'Przesuwa fokus interfejsu albo wybor o jedna pozycje w dol.',
        device: 'controller',
        section: 'Kontroler',
        primaryInputLabel: 'D-Pad Down',
        secondaryInputLabel: 'L Stick Down',
      },
      {
        id: 'controller-confirm',
        title: 'Potwierdz',
        description: 'Uruchamia glowna zaznaczona akcje i akceptuje wybor.',
        device: 'controller',
        section: 'Kontroler',
        primaryInputLabel: 'A / Cross',
      },
      {
        id: 'controller-back',
        title: 'Wstecz',
        description: 'Wraca do poprzedniego kroku albo zamyka aktywny panel.',
        device: 'controller',
        section: 'Kontroler',
        primaryInputLabel: 'B / Circle',
      },
      {
        id: 'controller-menu',
        title: 'Ustawienia / pauza',
        description: 'Otwiera ustawienia gry lub menu pauzy w zaleznosci od ekranu.',
        device: 'controller',
        section: 'Kontroler',
        primaryInputLabel: 'Start',
      },
      {
        id: 'controller-primary',
        title: 'Akcja glowna',
        description: 'Wykonuje najwazniejsza akcje kontekstowa, na przyklad start rundy albo odkrycie hasla.',
        device: 'controller',
        section: 'Kontroler',
        primaryInputLabel: 'R1 / RB',
      },
      {
        id: 'controller-secondary',
        title: 'Akcja alternatywna',
        description: 'Uruchamia druga akcje kontekstowa, gdy ekran ma dwa rownorzedne wybory.',
        device: 'controller',
        section: 'Kontroler',
        primaryInputLabel: 'L1 / LB',
      },
      {
        id: 'controller-rail',
        title: 'Przelacz rail / ranking',
        description: 'Zwija lub rozwija rail i aktualny ranking bez opuszczania ekranu gry.',
        device: 'controller',
        section: 'Kontroler',
        primaryInputLabel: 'Y / Triangle',
      },
    ],
  },
]

export const charadesSettingsAccentIcons = {
  general: Sparkles,
  audio: Waves,
  controls: Gamepad2,
}

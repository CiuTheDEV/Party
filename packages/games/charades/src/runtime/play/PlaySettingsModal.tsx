'use client'

import { RuntimeSettingsModal } from '@party/ui'

type SettingsFocusTarget = 'sound' | 'animations' | 'exit' | 'continue'
type SettingsExitConfirmFocusTarget = 'stay' | 'exit'

type Props = {
  soundEnabled: boolean
  animationsEnabled: boolean
  isExitConfirmOpen: boolean
  focusedTarget: SettingsFocusTarget
  exitConfirmFocusedTarget: SettingsExitConfirmFocusTarget
  isFocusVisible?: boolean
  onToggleSound: () => void
  onToggleAnimations: () => void
  onOpenExitConfirm: () => void
  onCancelExitConfirm: () => void
  onContinue: () => void
  onExitToMenu: () => void
  actionHints?: {
    confirm?: string | null
  }
}

export function PlaySettingsModal({
  soundEnabled,
  animationsEnabled,
  isExitConfirmOpen,
  focusedTarget,
  exitConfirmFocusedTarget,
  isFocusVisible = false,
  onToggleSound,
  onToggleAnimations,
  onOpenExitConfirm,
  onCancelExitConfirm,
  onContinue,
  onExitToMenu,
  actionHints,
}: Props) {
  const confirmHintLabel = actionHints?.confirm
  const mainActions = [
    {
      id: 'exit',
      label: 'Powrót do menu',
      kind: 'secondary' as const,
      hintLabel: confirmHintLabel,
      hintMuted: true,
      onPress: onOpenExitConfirm,
    },
    {
      id: 'continue',
      label: 'Kontynuuj',
      kind: 'primary' as const,
      hintLabel: confirmHintLabel,
      hintMuted: false,
      onPress: onContinue,
    },
  ]
  const confirmActions = [
    {
      id: 'exit',
      label: 'Tak, wróć do menu',
      kind: 'danger' as const,
      hintLabel: confirmHintLabel,
      hintMuted: false,
      onPress: onExitToMenu,
    },
    {
      id: 'stay',
      label: 'Zostań w grze',
      kind: 'secondary' as const,
      hintLabel: confirmHintLabel,
      hintMuted: true,
      onPress: onCancelExitConfirm,
    },
  ]

  return (
    <RuntimeSettingsModal
      eyebrow={isExitConfirmOpen ? 'Potwierdzenie' : 'Pauza'}
      title={isExitConfirmOpen ? 'Na pewno wrócić do menu?' : 'Ustawienia gry'}
      copy={
        isExitConfirmOpen
          ? 'Bieżąca rozgrywka zostanie przerwana. Użyj tej opcji tylko wtedy, gdy naprawdę chcesz opuścić mecz.'
          : undefined
      }
      toggles={[
        {
          id: 'sound',
          label: 'Dźwięk',
          description: 'Przygotowane pod efekty audio w trakcie rozgrywki.',
          enabled: soundEnabled,
          onToggle: onToggleSound,
        },
        {
          id: 'animations',
          label: 'Animacje',
          description: 'Wyłącza ruch i skraca przyszłe animacje w interfejsie.',
          enabled: animationsEnabled,
          onToggle: onToggleAnimations,
        },
      ]}
      actions={mainActions}
      focusedToggleId={!isExitConfirmOpen && (focusedTarget === 'sound' || focusedTarget === 'animations') ? focusedTarget : null}
      focusedActionId={
        !isExitConfirmOpen && (focusedTarget === 'exit' || focusedTarget === 'continue')
          ? focusedTarget
          : isExitConfirmOpen
            ? exitConfirmFocusedTarget
            : null
      }
      isFocusVisible={isFocusVisible}
      confirmView={
        isExitConfirmOpen
          ? {
              eyebrow: 'Potwierdzenie',
              title: 'Na pewno wrócić do menu?',
              copy: 'Bieżąca rozgrywka zostanie przerwana. Użyj tej opcji tylko wtedy, gdy naprawdę chcesz opuścić mecz.',
              actions: confirmActions,
              focusedActionId: exitConfirmFocusedTarget,
            }
          : null
      }
    />
  )
}

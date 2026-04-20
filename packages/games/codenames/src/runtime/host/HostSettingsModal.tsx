'use client'

import { RuntimeSettingsModal } from '@party/ui'

type SettingsFocusTarget = 'sound' | 'animations' | 'exit' | 'continue'
type SettingsExitConfirmFocusTarget = 'stay' | 'exit'

type Props = {
  canStartGame?: boolean
  soundEnabled: boolean
  animationsEnabled: boolean
  isExitConfirmOpen: boolean
  focusedTarget: SettingsFocusTarget
  exitConfirmFocusedTarget: SettingsExitConfirmFocusTarget
  confirmActionLabel?: string | null
  isFocusVisible?: boolean
  onStartGame?: () => void
  onToggleSound: () => void
  onToggleAnimations: () => void
  onOpenExitConfirm: () => void
  onCancelExitConfirm: () => void
  onContinue: () => void
  onExitToMenu: () => void
}

export function HostSettingsModal({
  canStartGame = false,
  soundEnabled,
  animationsEnabled,
  isExitConfirmOpen,
  focusedTarget,
  exitConfirmFocusedTarget,
  confirmActionLabel = null,
  isFocusVisible = true,
  onStartGame,
  onToggleSound,
  onToggleAnimations,
  onOpenExitConfirm,
  onCancelExitConfirm,
  onContinue,
  onExitToMenu,
}: Props) {
  const confirmActions = [
    {
      id: 'exit',
      label: 'Tak, wróć do menu',
      kind: 'danger' as const,
      hintLabel: confirmActionLabel,
      hintMuted: false,
      onPress: onExitToMenu,
    },
    {
      id: 'stay',
      label: 'Zostań w grze',
      kind: 'secondary' as const,
      hintLabel: confirmActionLabel,
      hintMuted: true,
      onPress: onCancelExitConfirm,
    },
  ]

  const mainActions = [
    {
      id: 'exit',
      label: 'Powrót do menu',
      kind: 'secondary' as const,
      hintLabel: confirmActionLabel,
      hintMuted: true,
      onPress: onOpenExitConfirm,
    },
    canStartGame
      ? {
          id: 'continue',
          label: 'Rozpocznij grę',
          kind: 'primary' as const,
          hintLabel: confirmActionLabel,
          hintMuted: false,
          onPress: onStartGame ?? onContinue,
        }
      : {
          id: 'continue',
          label: 'Kontynuuj',
          kind: 'primary' as const,
          hintLabel: confirmActionLabel,
          hintMuted: false,
          onPress: onContinue,
        },
  ]

  return (
    <RuntimeSettingsModal
      eyebrow={isExitConfirmOpen ? 'Potwierdzenie' : canStartGame ? 'Start gry' : 'Pauza'}
      title={
        isExitConfirmOpen ? 'Na pewno wrócić do menu?' : canStartGame ? 'Kapitanowie gotowi do startu' : 'Ustawienia gry'
      }
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

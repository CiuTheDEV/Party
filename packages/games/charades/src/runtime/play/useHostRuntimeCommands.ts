import { useCallback } from 'react'
import type {
  HostControlCommand,
  RuntimeExitConfirmFocusTarget,
  RuntimeIncorrectVerdictConfirmFocusTarget,
  RuntimeSettingsExitConfirmFocusTarget,
  RuntimeSettingsFocusTarget,
  RuntimeRoundSummaryFocusTarget,
  RuntimeVerdictFocusTarget,
  RuntimeVerdictPickerActionTarget,
} from './host-controls'

type HostRuntimeCommandUi = {
  openSettings: () => void
  closeSettings: () => void
  focusSettingsTarget: (target: RuntimeSettingsFocusTarget) => void
  openSettingsExitConfirm: () => void
  cancelSettingsExitConfirm: () => void
  focusSettingsExitConfirmTarget: (target: RuntimeSettingsExitConfirmFocusTarget) => void
  toggleSound: () => void
  toggleAnimations: () => void
  openExitConfirm: () => void
  closeExitConfirm: () => void
  focusExitConfirmTarget: (target: RuntimeExitConfirmFocusTarget) => void
}

type HostRuntimeCommandVerdict = {
  openVerdictPicker: () => void
  closeVerdictPicker: () => void
  openIncorrectVerdictConfirm: () => void
  closeIncorrectVerdictConfirm: () => void
  focusIncorrectVerdictConfirmTarget: (target: RuntimeIncorrectVerdictConfirmFocusTarget) => void
  focusRoundSummaryTarget: (target: RuntimeRoundSummaryFocusTarget) => void
  focusVerdictTarget: (target: RuntimeVerdictFocusTarget) => void
  focusVerdictPlayer: (playerIdx: number) => void
  showVerdictPickerPlayers: () => void
  openVerdictPickerActions: () => void
  focusVerdictPickerAction: (target: RuntimeVerdictPickerActionTarget) => void
  confirmVerdictPlayer: () => void
}

type UseHostRuntimeCommandsParams = {
  onStartRound: () => void
  onStopRound: () => void
  onFinishRoundSummary: () => void
  onExitToMenu: () => void
  onGiveIncorrectVerdict: () => void
  onSkipRoundOrder: () => void
  onToggleScoreRail: () => void
  onToggleVerdictWord: () => void
  ui: HostRuntimeCommandUi
  verdict: HostRuntimeCommandVerdict
}

export function useHostRuntimeCommands({
  onStartRound,
  onStopRound,
  onFinishRoundSummary,
  onExitToMenu,
  onGiveIncorrectVerdict,
  onSkipRoundOrder,
  onToggleScoreRail,
  onToggleVerdictWord,
  ui,
  verdict,
}: UseHostRuntimeCommandsParams) {
  return useCallback(
    (command: HostControlCommand) => {
      switch (command.type) {
        case 'open-settings':
          ui.openSettings()
          return
        case 'close-settings':
          ui.closeSettings()
          return
        case 'set-settings-focus':
          ui.focusSettingsTarget(command.target)
          return
        case 'open-settings-exit-confirm':
          ui.openSettingsExitConfirm()
          return
        case 'cancel-settings-exit-confirm':
          ui.cancelSettingsExitConfirm()
          return
        case 'set-settings-exit-confirm-focus':
          ui.focusSettingsExitConfirmTarget(command.target)
          return
        case 'toggle-settings-sound':
          ui.toggleSound()
          return
        case 'toggle-settings-animations':
          ui.toggleAnimations()
          return
        case 'open-exit-confirm':
          ui.openExitConfirm()
          return
        case 'close-exit-confirm':
          ui.closeExitConfirm()
          return
        case 'set-exit-confirm-focus':
          ui.focusExitConfirmTarget(command.target)
          return
        case 'open-incorrect-verdict-confirm':
          verdict.openIncorrectVerdictConfirm()
          return
        case 'close-incorrect-verdict-confirm':
          verdict.closeIncorrectVerdictConfirm()
          return
        case 'set-incorrect-verdict-confirm-focus':
          verdict.focusIncorrectVerdictConfirmTarget(command.target)
          return
        case 'exit-to-menu':
          onExitToMenu()
          return
        case 'start-round-order':
          onStartRound()
          return
        case 'skip-round-order':
          onSkipRoundOrder()
          return
        case 'stop-round':
          onStopRound()
          return
        case 'continue-round-summary':
          onFinishRoundSummary()
          return
        case 'set-round-summary-focus':
          verdict.focusRoundSummaryTarget(command.target)
          return
        case 'open-verdict-picker':
          verdict.openVerdictPicker()
          return
        case 'close-verdict-picker':
          verdict.closeVerdictPicker()
          return
        case 'set-verdict-focus':
          verdict.focusVerdictTarget(command.target)
          return
        case 'select-verdict-player':
          verdict.focusVerdictPlayer(command.playerIdx)
          return
        case 'set-verdict-picker-stage':
          if (command.stage === 'actions') {
            verdict.openVerdictPickerActions()
            return
          }

          verdict.showVerdictPickerPlayers()
          return
        case 'set-verdict-picker-action-target':
          verdict.focusVerdictPickerAction(command.target)
          return
        case 'confirm-verdict-player':
          verdict.confirmVerdictPlayer()
          return
        case 'give-incorrect-verdict':
          verdict.closeIncorrectVerdictConfirm()
          onGiveIncorrectVerdict()
          return
        case 'toggle-score-rail':
          onToggleScoreRail()
          return
        case 'toggle-verdict-word':
          onToggleVerdictWord()
          return
      }
    },
    [
      onExitToMenu,
      onFinishRoundSummary,
      onGiveIncorrectVerdict,
      onSkipRoundOrder,
      onStartRound,
      onStopRound,
      onToggleScoreRail,
      onToggleVerdictWord,
      ui,
      verdict,
    ],
  )
}

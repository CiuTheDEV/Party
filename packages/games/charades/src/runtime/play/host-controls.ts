// HostControlAction and HostNavigationAction are intentionally separate:
// runtime bindings are user-configurable (loaded from localStorage) and include
// game-specific actions like 'rail', while menu navigation uses fixed input maps
// from @party/ui. Merging them would couple the rebinding system to the shared framework.
export type HostControlDevice = 'keyboard' | 'controller'
import { getVerdictGridColumnCount } from './verdict-grid'

export type HostControlAction =
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'confirm'
  | 'back'
  | 'menu'
  | 'primary'
  | 'secondary'
  | 'rail'

export type HostControlPhase =
  | 'round-order'
  | 'prepare'
  | 'reveal-buffer'
  | 'timer-running'
  | 'round-summary'
  | 'verdict'

export type RuntimeSettingsFocusTarget = 'sound' | 'animations' | 'exit' | 'continue'
export type RuntimeSettingsExitConfirmFocusTarget = 'stay' | 'exit'
export type RuntimeVerdictFocusTarget = 'correct' | 'incorrect'
export type RuntimeVerdictPickerStage = 'players' | 'actions'
export type RuntimeVerdictPickerActionTarget = 'cancel' | 'confirm'
export type HostControlsContext = {
  phase: HostControlPhase
  isRoundOrderRevealing: boolean
  isSettingsOpen: boolean
  isSettingsExitConfirmOpen: boolean
  settingsFocusTarget?: RuntimeSettingsFocusTarget
  settingsExitConfirmFocusTarget?: RuntimeSettingsExitConfirmFocusTarget
  verdictFocusTarget?: RuntimeVerdictFocusTarget
  isVerdictPickerOpen: boolean
  verdictPickerStage?: RuntimeVerdictPickerStage
  verdictPickerActionTarget?: RuntimeVerdictPickerActionTarget
  selectedGuessedPlayerIdx: number | null
  guessedPlayerIndexes: number[]
  isReconnectBlocking: boolean
  canToggleScoreRail: boolean
  isVerdictWordVisible: boolean
}

export type HostControlCommand =
  | { type: 'open-settings' }
  | { type: 'close-settings' }
  | { type: 'set-settings-focus'; target: RuntimeSettingsFocusTarget }
  | { type: 'open-settings-exit-confirm' }
  | { type: 'cancel-settings-exit-confirm' }
  | { type: 'set-settings-exit-confirm-focus'; target: RuntimeSettingsExitConfirmFocusTarget }
  | { type: 'toggle-settings-sound' }
  | { type: 'toggle-settings-animations' }
  | { type: 'exit-to-menu' }
  | { type: 'start-round-order' }
  | { type: 'stop-round' }
  | { type: 'continue-round-summary' }
  | { type: 'open-verdict-picker' }
  | { type: 'close-verdict-picker' }
  | { type: 'set-verdict-focus'; target: RuntimeVerdictFocusTarget }
  | { type: 'select-verdict-player'; playerIdx: number }
  | { type: 'set-verdict-picker-stage'; stage: RuntimeVerdictPickerStage }
  | { type: 'set-verdict-picker-action-target'; target: RuntimeVerdictPickerActionTarget }
  | { type: 'confirm-verdict-player' }
  | { type: 'give-incorrect-verdict' }
  | { type: 'toggle-score-rail' }
  | { type: 'toggle-verdict-word' }

const HOST_CONTROL_BINDING_IDS: Record<HostControlDevice, Record<HostControlAction, string>> = {
  keyboard: {
    left: 'keyboard-left',
    right: 'keyboard-right',
    up: 'keyboard-up',
    down: 'keyboard-down',
    confirm: 'keyboard-confirm',
    back: 'keyboard-back',
    menu: 'keyboard-menu',
    primary: '',
    secondary: '',
    rail: 'keyboard-rail',
  },
  controller: {
    left: 'controller-left',
    right: 'controller-right',
    up: 'controller-up',
    down: 'controller-down',
    confirm: 'controller-confirm',
    back: 'controller-back',
    menu: 'controller-menu',
    primary: '',
    secondary: '',
    rail: 'controller-rail',
  },
}

const FIXED_RUNTIME_OVERLAY_HINT_LABELS: Record<HostControlDevice, Partial<Record<HostControlAction, string>>> = {
  keyboard: {
    left: 'Arrow Left',
    right: 'Arrow Right',
    up: 'Arrow Up',
    down: 'Arrow Down',
    confirm: 'Enter',
    back: 'Esc',
    menu: 'Tab',
  },
  controller: {
    left: 'D-Pad Left',
    right: 'D-Pad Right',
    up: 'D-Pad Up',
    down: 'D-Pad Down',
    confirm: 'A / Cross',
    back: 'B / Circle',
    menu: 'Start',
  },
}

export function getHostControlBindingId(device: HostControlDevice, action: HostControlAction) {
  return HOST_CONTROL_BINDING_IDS[device][action] ?? ''
}

export function getHostControlActionLabel(
  bindings: Record<string, string>,
  device: HostControlDevice,
  action: HostControlAction,
) {
  const bindingId = getHostControlBindingId(device, action)
  if (!bindingId) {
    return null
  }
  const primary = bindings[`${bindingId}:primary`] ?? ''
  const secondary = bindings[`${bindingId}:secondary`] ?? ''
  const labels = [primary, secondary].filter(Boolean)

  return labels.length > 0 ? labels.join(' / ') : null
}

export function getFixedRuntimeOverlayActionLabel(
  device: HostControlDevice,
  action: HostControlAction,
) {
  return FIXED_RUNTIME_OVERLAY_HINT_LABELS[device][action] ?? null
}

export function resolveHostControlAction(
  bindings: Record<string, string>,
  device: HostControlDevice,
  inputLabel: string,
): HostControlAction | null {
  const normalizedInput = inputLabel.trim()
  const deviceBindings = HOST_CONTROL_BINDING_IDS[device]

  for (const [action, bindingId] of Object.entries(deviceBindings) as Array<[HostControlAction, string]>) {
    if (!bindingId) {
      continue
    }
    const labels = [bindings[`${bindingId}:primary`] ?? '', bindings[`${bindingId}:secondary`] ?? '']
    if (labels.some((label) => label.trim() === normalizedInput)) {
      return action
    }
  }

  return null
}

export function resolveHostControlCommand(
  context: HostControlsContext,
  action: HostControlAction,
): HostControlCommand | null {
  if (context.isSettingsOpen) {
    return resolveSettingsCommand(context, action)
  }

  if (context.isReconnectBlocking) {
    return null
  }

  if (context.isVerdictPickerOpen) {
    return resolveVerdictPickerCommand(context, action)
  }

  if (action === 'menu') {
    return { type: 'open-settings' }
  }

  if (context.phase === 'round-order') {
    if (!context.isRoundOrderRevealing && action === 'confirm') {
      return { type: 'start-round-order' }
    }

    return null
  }

  if (context.phase === 'prepare') {
    if (action === 'rail' && context.canToggleScoreRail) {
      return { type: 'toggle-score-rail' }
    }

    return null
  }

  if (context.phase === 'timer-running') {
    if (action === 'confirm') {
      return { type: 'stop-round' }
    }

    return null
  }

  if (context.phase === 'round-summary') {
    if (action === 'confirm') {
      return { type: 'continue-round-summary' }
    }

    if (action === 'back') {
      return { type: 'exit-to-menu' }
    }

    return null
  }

  if (context.phase === 'verdict') {
    const verdictFocusTarget = context.verdictFocusTarget ?? 'correct'

    if (action === 'rail') {
      return { type: 'toggle-verdict-word' }
    }

    if (action === 'left') {
      return verdictFocusTarget === 'correct' ? null : { type: 'set-verdict-focus', target: 'correct' }
    }

    if (action === 'right') {
      return verdictFocusTarget === 'incorrect' ? null : { type: 'set-verdict-focus', target: 'incorrect' }
    }

    if (action === 'confirm' && verdictFocusTarget === 'correct') {
      return context.guessedPlayerIndexes.length > 0 ? { type: 'open-verdict-picker' } : null
    }

    if (action === 'confirm' && verdictFocusTarget === 'incorrect') {
      return { type: 'give-incorrect-verdict' }
    }
  }

  return null
}

function resolveSettingsCommand(
  context: HostControlsContext,
  action: HostControlAction,
): HostControlCommand | null {
  const settingsFocusTarget = context.settingsFocusTarget ?? 'continue'
  const settingsExitConfirmFocusTarget = context.settingsExitConfirmFocusTarget ?? 'stay'

  if (context.isSettingsExitConfirmOpen) {
    if (action === 'left' || action === 'up') {
      return settingsExitConfirmFocusTarget === 'stay'
        ? null
        : { type: 'set-settings-exit-confirm-focus', target: 'stay' }
    }

    if (action === 'right' || action === 'down') {
      return settingsExitConfirmFocusTarget === 'exit'
        ? null
        : { type: 'set-settings-exit-confirm-focus', target: 'exit' }
    }

    if (action === 'confirm') {
      return settingsExitConfirmFocusTarget === 'exit'
        ? { type: 'exit-to-menu' }
        : { type: 'cancel-settings-exit-confirm' }
    }

    if (action === 'back' || action === 'menu') {
      return { type: 'cancel-settings-exit-confirm' }
    }

    return null
  }

  if (action === 'left' || action === 'right' || action === 'up' || action === 'down') {
    const nextTarget = getNextSettingsFocusTarget(settingsFocusTarget, action)
    return nextTarget === settingsFocusTarget ? null : { type: 'set-settings-focus', target: nextTarget }
  }

  if (action === 'back' || action === 'menu') {
    return { type: 'close-settings' }
  }

  if (action === 'confirm') {
    if (settingsFocusTarget === 'sound') {
      return { type: 'toggle-settings-sound' }
    }

    if (settingsFocusTarget === 'animations') {
      return { type: 'toggle-settings-animations' }
    }

    if (settingsFocusTarget === 'exit') {
      return { type: 'open-settings-exit-confirm' }
    }

    return { type: 'close-settings' }
  }

  return null
}

function getNextSettingsFocusTarget(
  current: RuntimeSettingsFocusTarget,
  action: 'left' | 'right' | 'up' | 'down',
) {
  const targets: RuntimeSettingsFocusTarget[] = ['sound', 'animations', 'exit', 'continue']
  const currentIndex = targets.indexOf(current)

  if (currentIndex < 0) {
    return targets[0] ?? current
  }

  if (action === 'up') {
    return targets[Math.max(0, currentIndex - 1)] ?? current
  }

  if (action === 'down') {
    return targets[Math.min(targets.length - 1, currentIndex + 1)] ?? current
  }

  if (action === 'left') {
    return current === 'continue' ? 'exit' : current
  }

  if (action === 'right') {
    return current === 'exit' ? 'continue' : current
  }

  return current
}

function resolveVerdictPickerCommand(
  context: HostControlsContext,
  action: HostControlAction,
): HostControlCommand | null {
  const verdictPickerStage = context.verdictPickerStage ?? 'players'
  const verdictPickerActionTarget = context.verdictPickerActionTarget ?? 'confirm'

  if (verdictPickerStage === 'actions') {
    if (action === 'left') {
      return verdictPickerActionTarget === 'cancel'
        ? null
        : { type: 'set-verdict-picker-action-target', target: 'cancel' }
    }

    if (action === 'right') {
      return verdictPickerActionTarget === 'confirm'
        ? null
        : { type: 'set-verdict-picker-action-target', target: 'confirm' }
    }

    if (action === 'back' || action === 'menu') {
      return { type: 'set-verdict-picker-stage', stage: 'players' }
    }

    if (action === 'confirm') {
      return verdictPickerActionTarget === 'confirm'
        ? { type: 'confirm-verdict-player' }
        : { type: 'close-verdict-picker' }
    }

    return null
  }

  if (action === 'back' || action === 'menu') {
    return { type: 'close-verdict-picker' }
  }

  if (action === 'confirm') {
    return context.selectedGuessedPlayerIdx === null ? null : { type: 'set-verdict-picker-stage', stage: 'actions' }
  }

  if (action !== 'left' && action !== 'right' && action !== 'up' && action !== 'down') {
    return null
  }

  const nextPlayerIdx = getNextVerdictPlayerIndexInGrid(
    context.guessedPlayerIndexes,
    context.selectedGuessedPlayerIdx,
    action,
  )

  return nextPlayerIdx === null ? null : { type: 'select-verdict-player', playerIdx: nextPlayerIdx }
}

function getNextVerdictPlayerIndexInGrid(
  playerIndexes: number[],
  currentSelection: number | null,
  action: 'left' | 'right' | 'up' | 'down',
) {
  if (playerIndexes.length === 0) {
    return null
  }

  if (currentSelection === null) {
    return playerIndexes[0] ?? null
  }

  const currentIndex = playerIndexes.indexOf(currentSelection)
  if (currentIndex < 0) {
    return playerIndexes[0] ?? null
  }

  const columns = getVerdictGridColumnCount(playerIndexes.length)
  let nextIndex = currentIndex

  if (action === 'left') {
    nextIndex = currentIndex - 1
  } else if (action === 'right') {
    nextIndex = currentIndex + 1
  } else if (action === 'up') {
    nextIndex = currentIndex - columns
  } else if (action === 'down') {
    nextIndex = currentIndex + columns
  }

  if (nextIndex < 0 || nextIndex >= playerIndexes.length) {
    return currentSelection
  }

  return playerIndexes[nextIndex] ?? currentSelection
}

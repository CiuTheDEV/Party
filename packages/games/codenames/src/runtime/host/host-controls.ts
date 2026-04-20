import { getBindingValue, type GamepadProfile } from '../../menu/codenames-controls-bindings'
import type { HostControlAction, HostControlDevice } from './runtime-input-helpers'

type RuntimePhase = 'waiting' | 'playing' | 'assassin-reveal' | 'ended'

export type HostControlCommand =
  | { type: 'reveal-card'; index: number }
  | { type: 'toggle-status-rail' }
  | { type: 'open-settings' }
  | { type: 'close-settings' }
  | { type: 'toggle-settings-sound' }
  | { type: 'toggle-settings-animations' }
  | { type: 'start-game' }
  | { type: 'confirm-reset' }
  | { type: 'confirm-assassin-team'; team: 'red' | 'blue' }
  | { type: 'close-start-blocked' }
  | { type: 'reset-pool-and-retry' }
  | { type: 'exit-to-menu' }

export type RuntimeCommandContext = {
  phase: RuntimePhase
  boardSelectionIndex: number
  boardUnlocked: boolean
  assassinFocusedTeam: 'red' | 'blue'
  canStartGame: boolean
}

const HOST_CONTROL_BINDING_IDS: Record<HostControlDevice, Record<HostControlAction, string>> = {
  keyboard: {
    left: 'keyboard-left',
    right: 'keyboard-right',
    up: 'keyboard-up',
    down: 'keyboard-down',
    confirm: 'keyboard-confirm',
    back: 'keyboard-back',
    menu: 'keyboard-menu',
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
    rail: 'controller-rail',
  },
}

export function getHostControlActionLabel(
  bindings: Record<string, string>,
  device: HostControlDevice,
  action: HostControlAction,
) {
  const bindingId = HOST_CONTROL_BINDING_IDS[device][action]
  const primary = getBindingValue(bindings, bindingId, 'primary')
  const secondary = getBindingValue(bindings, bindingId, 'secondary')
  const labels = [primary, secondary].filter(Boolean)

  return labels.length > 0 ? labels.join(' / ') : null
}

export function getVisibleHostControlActionLabel(
  bindings: Record<string, string>,
  device: HostControlDevice,
  action: HostControlAction,
  formatControllerLabelForProfile: (label: string, profile: GamepadProfile) => string,
  profile: GamepadProfile,
) {
  const bindingId = HOST_CONTROL_BINDING_IDS[device][action]
  const primary = getBindingValue(bindings, bindingId, 'primary')
  const secondary = getBindingValue(bindings, bindingId, 'secondary')
  const labels = [primary, secondary].filter(Boolean)

  if (labels.length === 0) {
    return null
  }

  if (device !== 'controller') {
    return labels.join(' / ')
  }

  return labels
    .map((label) => formatControllerLabelForProfile(label, profile))
    .join(' / ')
}

export function resolveRuntimeCommand(
  commandId: string,
  context: RuntimeCommandContext,
): HostControlCommand | null {
  switch (commandId) {
    case 'codenames.runtime.reveal-selected-card':
      return context.phase === 'playing' && context.boardUnlocked
        ? { type: 'reveal-card', index: context.boardSelectionIndex }
        : null
    case 'codenames.runtime.toggle-status-rail':
      return { type: 'toggle-status-rail' }
    case 'codenames.runtime.open-settings':
      return { type: 'open-settings' }
    case 'codenames.runtime.close-settings':
      return { type: 'close-settings' }
    case 'codenames.runtime.toggle-settings-sound':
      return { type: 'toggle-settings-sound' }
    case 'codenames.runtime.toggle-settings-animations':
      return { type: 'toggle-settings-animations' }
    case 'codenames.runtime.start-game':
      return context.phase === 'waiting' && context.canStartGame ? { type: 'start-game' } : null
    case 'codenames.runtime.confirm-reset':
      return { type: 'confirm-reset' }
    case 'codenames.runtime.confirm-assassin-team':
      return context.phase === 'assassin-reveal'
        ? { type: 'confirm-assassin-team', team: context.assassinFocusedTeam }
        : null
    case 'codenames.runtime.close-start-blocked':
      return { type: 'close-start-blocked' }
    case 'codenames.runtime.reset-pool-and-retry':
      return { type: 'reset-pool-and-retry' }
    case 'codenames.runtime.exit-to-menu':
      return { type: 'exit-to-menu' }
    default:
      return null
  }
}

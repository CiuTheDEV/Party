import { charadesSettingsCategories, type CharadesControlsBinding, type CharadesControlsDevice } from './charades-settings-overlay-data'

export const CHARADES_BINDINGS_STORAGE_KEY = 'charades:settings:bindings:v1'
export const CHARADES_BINDINGS_UPDATED_EVENT = 'charades:settings:bindings-updated'
export type BindingSlot = 'primary' | 'secondary'
export type GamepadProfile = 'xbox' | 'playstation' | 'generic'

export type GamepadSnapshot = {
  axes: number[]
  buttons: number[]
}

const keyboardLabelMap: Record<string, string> = {
  ' ': 'Space',
  ArrowDown: 'Arrow Down',
  ArrowLeft: 'Arrow Left',
  ArrowRight: 'Arrow Right',
  ArrowUp: 'Arrow Up',
  Backspace: 'Backspace',
  CapsLock: 'Caps Lock',
  Delete: 'Delete',
  Enter: 'Enter',
  Escape: 'Esc',
  Insert: 'Insert',
  PageDown: 'Page Down',
  PageUp: 'Page Up',
  Tab: 'Tab',
}

const ignoredKeyboardKeys = new Set(['Alt', 'AltGraph', 'CapsLock', 'Control', 'Fn', 'Meta', 'NumLock', 'ScrollLock', 'Shift'])

const controllerButtonLabels = [
  'A / Cross',
  'B / Circle',
  'X / Square',
  'Y / Triangle',
  'L1 / LB',
  'R1 / RB',
  'L2 / LT',
  'R2 / RT',
  'Select / View',
  'Start',
  'L3',
  'R3',
  'D-Pad Up',
  'D-Pad Down',
  'D-Pad Left',
  'D-Pad Right',
  'Home',
]

const controllerProfileLabelMap: Record<string, Record<Exclude<GamepadProfile, 'generic'>, string>> = {
  'A / Cross': { xbox: 'A', playstation: 'Cross' },
  'B / Circle': { xbox: 'B', playstation: 'Circle' },
  'X / Square': { xbox: 'X', playstation: 'Square' },
  'Y / Triangle': { xbox: 'Y', playstation: 'Triangle' },
  'L1 / LB': { xbox: 'LB', playstation: 'L1' },
  'R1 / RB': { xbox: 'RB', playstation: 'R1' },
  'L2 / LT': { xbox: 'LT', playstation: 'L2' },
  'R2 / RT': { xbox: 'RT', playstation: 'R2' },
  'Select / View': { xbox: 'View', playstation: 'Create' },
}

const controlsBindings = charadesSettingsCategories.find((category) => category.id === 'controls')?.bindings ?? []
const ignoredGamepadIdParts = ['audio', 'headset', 'headphone', 'hyperx', 'cloud', 'mic', 'speaker']
const legacyBindingMigrations: Record<string, string> = {
  'keyboard-primary:primary': 'keyboard-confirm:primary',
  'keyboard-primary:secondary': 'keyboard-confirm:secondary',
  'controller-primary:primary': 'controller-confirm:primary',
  'controller-primary:secondary': 'controller-confirm:secondary',
}

export function createDefaultBindings() {
  return Object.fromEntries(
    controlsBindings.flatMap((binding) => [
      [getBindingSlotKey(binding.id, 'primary'), binding.primaryInputLabel],
      [getBindingSlotKey(binding.id, 'secondary'), binding.secondaryInputLabel ?? ''],
    ]),
  ) as Record<string, string>
}

export function getBindingSlotKey(bindingId: string, slot: BindingSlot) {
  return `${bindingId}:${slot}`
}

export function getBindingValue(bindings: Record<string, string>, bindingId: string, slot: BindingSlot) {
  return bindings[getBindingSlotKey(bindingId, slot)] ?? ''
}

export function getBindingLabels(bindings: Record<string, string>, bindingId: string) {
  return {
    primary: getBindingValue(bindings, bindingId, 'primary'),
    secondary: getBindingValue(bindings, bindingId, 'secondary'),
  }
}

export function hasBindingChanges(savedBindings: Record<string, string>, draftBindings: Record<string, string>) {
  const allKeys = new Set([...Object.keys(savedBindings), ...Object.keys(draftBindings)])

  for (const key of allKeys) {
    if ((savedBindings[key] ?? '') !== (draftBindings[key] ?? '')) {
      return true
    }
  }

  return false
}

export function detectGamepadProfile(gamepadId: string): GamepadProfile {
  const normalizedId = gamepadId.toLowerCase()

  if (
    normalizedId.includes('xbox') ||
    normalizedId.includes('xinput') ||
    normalizedId.includes('microsoft')
  ) {
    return 'xbox'
  }

  if (
    normalizedId.includes('playstation') ||
    normalizedId.includes('dualshock') ||
    normalizedId.includes('dualsense') ||
    normalizedId.includes('sony') ||
    normalizedId.includes('wireless controller') ||
    normalizedId.includes('ps5') ||
    normalizedId.includes('ps4')
  ) {
    return 'playstation'
  }

  return 'generic'
}

export function formatControllerLabelForProfile(label: string, profile: GamepadProfile) {
  if (!label || profile === 'generic') {
    return label
  }

  return controllerProfileLabelMap[label]?.[profile] ?? label
}

export function getControlsBindings() {
  return controlsBindings
}

export function listConnectedGamepads() {
  if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') {
    return []
  }

  return Array.from(navigator.getGamepads()).filter((gamepad): gamepad is Gamepad => Boolean(gamepad))
}

export function loadPersistedBindings() {
  if (typeof window === 'undefined') {
    return createDefaultBindings()
  }

  const defaults = createDefaultBindings()
  const raw = window.localStorage.getItem(CHARADES_BINDINGS_STORAGE_KEY)

  if (!raw) {
    return defaults
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const migratedParsed = { ...parsed }

    for (const [legacyKey, nextKey] of Object.entries(legacyBindingMigrations)) {
      if (typeof migratedParsed[nextKey] !== 'string' && typeof migratedParsed[legacyKey] === 'string') {
        migratedParsed[nextKey] = migratedParsed[legacyKey]
      }
    }

    const merged = {
      ...defaults,
      ...Object.fromEntries(
        Object.entries(migratedParsed).filter(([bindingId, value]) => bindingId in defaults && typeof value === 'string'),
      ),
    }
    return merged as Record<string, string>
  } catch {
    return defaults
  }
}

export function persistBindings(bindings: Record<string, string>) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(CHARADES_BINDINGS_STORAGE_KEY, JSON.stringify(bindings))
  window.dispatchEvent(new CustomEvent(CHARADES_BINDINGS_UPDATED_EVENT, { detail: bindings }))
}

export function normalizeKeyboardInput(key: string) {
  if (ignoredKeyboardKeys.has(key)) {
    return null
  }

  if (keyboardLabelMap[key]) {
    return keyboardLabelMap[key]
  }

  if (key.length === 1) {
    return key === ' ' ? 'Space' : key.toUpperCase()
  }

  return key.replace(/([a-z])([A-Z])/g, '$1 $2')
}

export function createGamepadSnapshot(gamepad: Gamepad): GamepadSnapshot {
  return {
    axes: gamepad.axes.map((axis) => axis),
    buttons: gamepad.buttons.map((button) => button.value),
  }
}

export function getGamepadInputLabel(gamepad: Gamepad, previousSnapshot?: GamepadSnapshot | null) {
  const pressedButton = gamepad.buttons.findIndex((button, index) => {
    const previousValue = previousSnapshot?.buttons[index] ?? 0
    return button.value - previousValue > 0.45 || (button.pressed && previousValue < 0.5)
  })
  if (pressedButton >= 0) {
    return controllerButtonLabels[pressedButton] ?? `Button ${pressedButton + 1}`
  }

  const axisThreshold = 0.7
  const axisDeltaThreshold = 0.35
  const horizontal = gamepad.axes[0] ?? 0
  const vertical = gamepad.axes[1] ?? 0
  const altHorizontal = gamepad.axes[2] ?? 0
  const altVertical = gamepad.axes[3] ?? 0
  const previousHorizontal = previousSnapshot?.axes[0] ?? 0
  const previousVertical = previousSnapshot?.axes[1] ?? 0
  const previousAltHorizontal = previousSnapshot?.axes[2] ?? 0
  const previousAltVertical = previousSnapshot?.axes[3] ?? 0

  if (horizontal <= -axisThreshold && horizontal - previousHorizontal < -axisDeltaThreshold) return 'L Stick Left'
  if (horizontal >= axisThreshold && horizontal - previousHorizontal > axisDeltaThreshold) return 'L Stick Right'
  if (vertical <= -axisThreshold && vertical - previousVertical < -axisDeltaThreshold) return 'L Stick Up'
  if (vertical >= axisThreshold && vertical - previousVertical > axisDeltaThreshold) return 'L Stick Down'
  if (altHorizontal <= -axisThreshold && altHorizontal - previousAltHorizontal < -axisDeltaThreshold) return 'R Stick Left'
  if (altHorizontal >= axisThreshold && altHorizontal - previousAltHorizontal > axisDeltaThreshold) return 'R Stick Right'
  if (altVertical <= -axisThreshold && altVertical - previousAltVertical < -axisDeltaThreshold) return 'R Stick Up'
  if (altVertical >= axisThreshold && altVertical - previousAltVertical > axisDeltaThreshold) return 'R Stick Down'

  return null
}

export function getCurrentGamepadInputLabel(gamepad: Gamepad) {
  const pressedButton = gamepad.buttons.findIndex((button) => button.pressed || button.value > 0.5)
  if (pressedButton >= 0) {
    return controllerButtonLabels[pressedButton] ?? `Button ${pressedButton + 1}`
  }

  const axisThreshold = 0.7
  const horizontal = gamepad.axes[0] ?? 0
  const vertical = gamepad.axes[1] ?? 0
  const altHorizontal = gamepad.axes[2] ?? 0
  const altVertical = gamepad.axes[3] ?? 0

  if (horizontal <= -axisThreshold) return 'L Stick Left'
  if (horizontal >= axisThreshold) return 'L Stick Right'
  if (vertical <= -axisThreshold) return 'L Stick Up'
  if (vertical >= axisThreshold) return 'L Stick Down'
  if (altHorizontal <= -axisThreshold) return 'R Stick Left'
  if (altHorizontal >= axisThreshold) return 'R Stick Right'
  if (altVertical <= -axisThreshold) return 'R Stick Up'
  if (altVertical >= axisThreshold) return 'R Stick Down'

  return null
}

function getGamepadScore(gamepad: Gamepad) {
  const id = gamepad.id.toLowerCase()
  const hasIgnoredId = ignoredGamepadIdParts.some((part) => id.includes(part))
  const currentInput = getCurrentGamepadInputLabel(gamepad)

  let score = 0
  if (currentInput) score += 100
  if (gamepad.mapping === 'standard') score += 30
  score += Math.min(gamepad.buttons.length, 20)
  score += Math.min(gamepad.axes.length * 2, 12)
  if (hasIgnoredId) score -= 120

  return score
}

export function pickPreferredGamepad(gamepads: Gamepad[]) {
  if (gamepads.length === 0) {
    return null
  }

  return [...gamepads].sort((left, right) => getGamepadScore(right) - getGamepadScore(left))[0] ?? null
}

export function applyBindingAssignment(
  currentBindings: Record<string, string>,
  targetBinding: CharadesControlsBinding,
  targetSlot: BindingSlot,
  nextLabel: string,
) {
  const nextBindings = { ...currentBindings }
  const targetKey = getBindingSlotKey(targetBinding.id, targetSlot)
  const previousValue = nextBindings[targetKey] ?? ''
  const normalizedLabel = nextLabel.trim()

  const conflictingSlot = getControlsBindings()
    .filter((binding) => binding.device === targetBinding.device)
    .flatMap((binding) => (['primary', 'secondary'] as BindingSlot[]).map((slot) => ({ binding, slot })))
    .find(
      ({ binding, slot }) =>
        !(binding.id === targetBinding.id && slot === targetSlot) &&
        getBindingValue(nextBindings, binding.id, slot) === normalizedLabel,
    )

  nextBindings[targetKey] = normalizedLabel

  if (conflictingSlot) {
    nextBindings[getBindingSlotKey(conflictingSlot.binding.id, conflictingSlot.slot)] = previousValue
  }

  return nextBindings
}

export function getBindingDevice(bindingId: string): CharadesControlsDevice | null {
  return getControlsBindings().find((binding) => binding.id === bindingId)?.device ?? null
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tagName = target.tagName.toLowerCase()
  return target.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select'
}

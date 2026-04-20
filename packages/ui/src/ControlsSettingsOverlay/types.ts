import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export type ControlsSettingsOverlayDevice = 'keyboard' | 'controller'
export type ControlsSettingsOverlayInputDevice = 'mouse' | 'keyboard' | 'controller'
export type ControlsSettingsOverlayGamepadProfile = 'xbox' | 'playstation' | 'generic'
export type ControlsSettingsOverlayBindingSlot = 'primary' | 'secondary'
export type ControlsSettingsOverlayFocusArea = 'tabs' | 'device' | 'bindings' | 'footer'
export type ControlsSettingsOverlayFooterFocusId = 'reset' | 'save'
export type ControlsSettingsOverlayAction = 'left' | 'right' | 'up' | 'down' | 'confirm' | 'back' | 'menu' | 'primary' | 'secondary'

export type ControlsSettingsOverlayGamepadSnapshot = {
  axes: number[]
  buttons: number[]
}

export type ControlsSettingsOverlayConnectedGamepad = {
  index: number
  id: string
}

export type ControlsSettingsOverlayGamepadDebugState = {
  connected: boolean
  id: string
  index: number | null
  buttons: number
  axes: number
  currentInput: string | null
}

export type ControlsSettingsOverlayBinding<TDevice extends string = ControlsSettingsOverlayDevice> = {
  id: string
  title: string
  description: string
  device: TDevice
  section: string
  primaryInputLabel: string
  secondaryInputLabel?: string
}

export type ControlsSettingsOverlayCategory<
  TBinding extends ControlsSettingsOverlayBinding = ControlsSettingsOverlayBinding,
  TCategoryId extends string = string,
> = {
  id: TCategoryId
  label: string
  icon: LucideIcon
  description: string
  bindings?: TBinding[]
}

export type ControlsSettingsOverlayNavigation<
  TCategoryId extends string,
  TTargetId extends string,
  TScreenId extends string = string,
  TZoneId extends string = string,
> = {
  settingsScreenId: TScreenId
  tabsZoneId: TZoneId
  deviceZoneId: TZoneId
  bindingsZoneId: TZoneId
  footerZoneId: TZoneId
  footerResetTargetId: TTargetId
  footerSaveTargetId: TTargetId
  getSettingsTabTarget: (categoryId: TCategoryId) => TTargetId
  getControlsDeviceTarget: (device: ControlsSettingsOverlayDevice) => TTargetId
  getSettingsEntryTarget: (categoryId: TCategoryId) => { zoneId: TZoneId; targetId: TTargetId }
}

export type ControlsSettingsOverlayHelpers = {
  areConnectedGamepadOptionsEqual: (
    left: ControlsSettingsOverlayConnectedGamepad[],
    right: ControlsSettingsOverlayConnectedGamepad[],
  ) => boolean
  areGamepadDebugStatesEqual: (
    left: ControlsSettingsOverlayGamepadDebugState,
    right: ControlsSettingsOverlayGamepadDebugState,
  ) => boolean
  getNextDialogActionIndex: (current: number, direction: -1 | 1, actionCount: number) => number
  publishSettingsDirtyState: (isDirty: boolean, onUnsavedChangesChange?: (value: boolean) => void) => void
}

export type ControlsSettingsOverlayMenuControlsApi<TCategoryId extends string> = {
  getNextSettingsCategoryId: (
    current: TCategoryId,
    action: ControlsSettingsOverlayAction,
  ) => TCategoryId
  resolveSettingsTabsCommand: (
    current: TCategoryId,
    action: ControlsSettingsOverlayAction,
  ) => { type: 'select-category'; categoryId: TCategoryId } | { type: 'focus-rail' } | null
  getNextBindingFocusId: (
    bindingIds: string[],
    current: string,
    action: ControlsSettingsOverlayAction,
  ) => string
  getNextFooterFocusId: (
    current: ControlsSettingsOverlayFooterFocusId,
    action: ControlsSettingsOverlayAction,
  ) => ControlsSettingsOverlayFooterFocusId
  getNextSettingsFocusArea: (
    current: ControlsSettingsOverlayFocusArea,
    action: ControlsSettingsOverlayAction,
    options: { isControlsView: boolean },
  ) => ControlsSettingsOverlayFocusArea
}

export type ControlsSettingsOverlayBindingApi<TBinding extends ControlsSettingsOverlayBinding> = {
  createDefaultBindings: () => Record<string, string>
  loadPersistedBindings: () => Record<string, string>
  persistBindings: (bindings: Record<string, string>) => void
  hasBindingChanges: (savedBindings: Record<string, string>, draftBindings: Record<string, string>) => boolean
  getBindingSlotKey: (bindingId: string, slot: ControlsSettingsOverlayBindingSlot) => string
  getBindingValue: (bindings: Record<string, string>, bindingId: string, slot: ControlsSettingsOverlayBindingSlot) => string
  getBindingDevice: (bindingId: string) => ControlsSettingsOverlayDevice | null
  applyBindingAssignment: (
    currentBindings: Record<string, string>,
    targetBinding: TBinding,
    targetSlot: ControlsSettingsOverlayBindingSlot,
    nextLabel: string,
  ) => Record<string, string>
  normalizeKeyboardInput: (key: string) => string | null
  detectGamepadProfile: (gamepadId: string) => ControlsSettingsOverlayGamepadProfile
  formatControllerLabelForProfile: (label: string, profile: ControlsSettingsOverlayGamepadProfile) => string
  listConnectedGamepads: () => Gamepad[]
  pickPreferredGamepad: (gamepads: Gamepad[]) => Gamepad | null
  createGamepadSnapshot: (gamepad: Gamepad) => ControlsSettingsOverlayGamepadSnapshot
  getGamepadInputLabel: (gamepad: Gamepad, previousSnapshot?: ControlsSettingsOverlayGamepadSnapshot | null) => string | null
  getCurrentGamepadInputLabel: (gamepad: Gamepad) => string | null
}

export type ControlsSettingsOverlayStyles = Record<string, string>

export type ControlsSettingsOverlayCommonProps<
  TMenuView extends string,
  TCategory extends ControlsSettingsOverlayCategory,
  TBinding extends ControlsSettingsOverlayBinding,
  TTargetId extends string = string,
  TScreenId extends string = string,
  TZoneId extends string = string,
> = {
  onBack: () => void
  onFocusRail?: () => void
  onWakeHostFocus?: (device?: ControlsSettingsOverlayDevice) => void
  onSleepHostFocus?: () => void
  registerSettingsExitGuard?: (guard: ((view: TMenuView) => boolean) | null) => void
  onCommitViewChange?: (view: TMenuView) => void
  onModalOpenChange?: (value: boolean) => void
  onUnsavedChangesChange?: (value: boolean) => void
  isHostFocused?: boolean
  isHostInputAwake?: boolean
  categories: readonly TCategory[]
  navigation: ControlsSettingsOverlayNavigation<TCategory['id'], TTargetId, TScreenId, TZoneId>
  bindingApi: ControlsSettingsOverlayBindingApi<TBinding>
  helpers: ControlsSettingsOverlayHelpers
  menuControlsApi: ControlsSettingsOverlayMenuControlsApi<TCategory['id']>
  defaultExitView: TMenuView
}

export type ControlsSettingsOverlayProps<
  TMenuView extends string,
  TCategory extends ControlsSettingsOverlayCategory,
  TBinding extends ControlsSettingsOverlayBinding,
  TTargetId extends string = string,
  TScreenId extends string = string,
  TZoneId extends string = string,
> = ControlsSettingsOverlayCommonProps<TMenuView, TCategory, TBinding, TTargetId, TScreenId, TZoneId> & {
  styles: ControlsSettingsOverlayStyles
}

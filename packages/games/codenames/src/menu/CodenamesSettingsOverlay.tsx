'use client'

import { ControlsSettingsOverlay } from '@party/ui'
import styles from './CodenamesSettingsOverlay.module.css'
import {
  applyBindingAssignment,
  createDefaultBindings,
  createGamepadSnapshot,
  detectGamepadProfile,
  getBindingDevice,
  getBindingSlotKey,
  getBindingValue,
  formatControllerLabelForProfile,
  getCurrentGamepadInputLabel,
  getGamepadInputLabel,
  hasBindingChanges,
  listConnectedGamepads,
  loadPersistedBindings,
  normalizeKeyboardInput,
  pickPreferredGamepad,
  persistBindings,
} from './codenames-controls-bindings'
import { codenamesSettingsCategories } from './codenames-settings-overlay-data'
import {
  areConnectedGamepadOptionsEqual,
  areGamepadDebugStatesEqual,
  getNextDialogActionIndex,
  publishSettingsDirtyState,
} from './codenames-settings-overlay-helpers'
import {
  getNextBindingFocusId,
  getNextFooterFocusId,
  getNextSettingsCategoryId,
  getNextSettingsFocusArea,
  resolveSettingsTabsCommand,
} from './menu-controls'
import {
  CODENAMES_NAVIGATION_SCREENS,
  CODENAMES_NAVIGATION_TARGETS,
  CODENAMES_NAVIGATION_ZONES,
  getCodenamesControlsDeviceTarget,
  getCodenamesSettingsEntryTarget,
  getCodenamesSettingsTabTarget,
} from '../navigation/codenames-navigation-targets'
import type { CodenamesMenuView } from './menu-view'

type Props = {
  onBack: () => void
  onFocusRail?: () => void
  onWakeHostFocus?: (device?: 'keyboard' | 'controller') => void
  onSleepHostFocus?: () => void
  registerSettingsExitGuard?: (guard: ((view: CodenamesMenuView) => boolean) | null) => void
  onCommitViewChange?: (view: CodenamesMenuView) => void
  onModalOpenChange?: (value: boolean) => void
  onUnsavedChangesChange?: (value: boolean) => void
  isHostFocused?: boolean
  isHostInputAwake?: boolean
}

const bindingApi = {
  applyBindingAssignment,
  createDefaultBindings,
  createGamepadSnapshot,
  detectGamepadProfile,
  formatControllerLabelForProfile,
  getBindingDevice,
  getBindingSlotKey,
  getBindingValue,
  getCurrentGamepadInputLabel,
  getGamepadInputLabel,
  hasBindingChanges,
  listConnectedGamepads,
  loadPersistedBindings,
  normalizeKeyboardInput,
  persistBindings,
  pickPreferredGamepad,
}

const helpers = {
  areConnectedGamepadOptionsEqual,
  areGamepadDebugStatesEqual,
  getNextDialogActionIndex,
  publishSettingsDirtyState,
}

const menuControlsApi = {
  getNextBindingFocusId,
  getNextFooterFocusId,
  getNextSettingsCategoryId,
  getNextSettingsFocusArea,
  resolveSettingsTabsCommand,
}

const navigation = {
  settingsScreenId: CODENAMES_NAVIGATION_SCREENS.settings,
  tabsZoneId: CODENAMES_NAVIGATION_ZONES.tabs,
  deviceZoneId: CODENAMES_NAVIGATION_ZONES.device,
  bindingsZoneId: CODENAMES_NAVIGATION_ZONES.bindings,
  footerZoneId: CODENAMES_NAVIGATION_ZONES.footer,
  footerResetTargetId: CODENAMES_NAVIGATION_TARGETS.settingsFooterReset,
  footerSaveTargetId: CODENAMES_NAVIGATION_TARGETS.settingsFooterSave,
  getSettingsTabTarget: getCodenamesSettingsTabTarget,
  getControlsDeviceTarget: getCodenamesControlsDeviceTarget,
  getSettingsEntryTarget: getCodenamesSettingsEntryTarget,
}

export function CodenamesSettingsOverlay(props: Props) {
  return (
    <ControlsSettingsOverlay
      {...props}
      categories={codenamesSettingsCategories}
      navigation={navigation}
      bindingApi={bindingApi}
      helpers={helpers}
      menuControlsApi={menuControlsApi}
      defaultExitView="mode"
      styles={styles}
    />
  )
}

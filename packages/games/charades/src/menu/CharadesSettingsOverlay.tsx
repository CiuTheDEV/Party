'use client'

import { ControlsSettingsOverlay } from '@party/ui'
import styles from './CharadesSettingsOverlay.module.css'
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
} from './charades-controls-bindings'
import { charadesSettingsCategories } from './charades-settings-overlay-data'
import {
  areConnectedGamepadOptionsEqual,
  areGamepadDebugStatesEqual,
  getNextDialogActionIndex,
  publishSettingsDirtyState,
} from './charades-settings-overlay-helpers'
import {
  getNextBindingFocusId,
  getNextFooterFocusId,
  getNextSettingsCategoryId,
  getNextSettingsFocusArea,
  resolveSettingsTabsCommand,
} from './menu-controls'
import {
  CHARADES_NAVIGATION_SCREENS,
  CHARADES_NAVIGATION_TARGETS,
  CHARADES_NAVIGATION_ZONES,
  getCharadesControlsDeviceTarget,
  getCharadesSettingsEntryTarget,
  getCharadesSettingsTabTarget,
} from '../navigation/charades-navigation-targets'
import type { CharadesMenuView } from './menu-view'

type Props = {
  onBack: () => void
  onFocusRail?: () => void
  onWakeHostFocus?: (device?: 'keyboard' | 'controller') => void
  onSleepHostFocus?: () => void
  registerSettingsExitGuard?: (guard: ((view: CharadesMenuView) => boolean) | null) => void
  onCommitViewChange?: (view: CharadesMenuView) => void
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
  settingsScreenId: CHARADES_NAVIGATION_SCREENS.settings,
  tabsZoneId: CHARADES_NAVIGATION_ZONES.tabs,
  deviceZoneId: CHARADES_NAVIGATION_ZONES.device,
  bindingsZoneId: CHARADES_NAVIGATION_ZONES.bindings,
  footerZoneId: CHARADES_NAVIGATION_ZONES.footer,
  footerResetTargetId: CHARADES_NAVIGATION_TARGETS.settingsFooterReset,
  footerSaveTargetId: CHARADES_NAVIGATION_TARGETS.settingsFooterSave,
  getSettingsTabTarget: getCharadesSettingsTabTarget,
  getControlsDeviceTarget: getCharadesControlsDeviceTarget,
  getSettingsEntryTarget: getCharadesSettingsEntryTarget,
}

export function CharadesSettingsOverlay(props: Props) {
  return (
    <ControlsSettingsOverlay
      {...props}
      categories={charadesSettingsCategories}
      navigation={navigation}
      bindingApi={bindingApi}
      helpers={helpers}
      menuControlsApi={menuControlsApi}
      defaultExitView="mode"
      styles={styles}
    />
  )
}

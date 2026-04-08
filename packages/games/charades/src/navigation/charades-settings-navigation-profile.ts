import type { HostNavigationProfile } from '@party/game-sdk'
import type { CharadesControlsDevice, CharadesSettingsCategoryId } from '../menu/charades-settings-overlay-data'
import { CHARADES_NAVIGATION_COMMANDS } from './charades-navigation-actions'
import {
  CHARADES_NAVIGATION_TARGETS,
  CHARADES_NAVIGATION_SCREENS,
  CHARADES_NAVIGATION_ZONES,
  getCharadesBindingsEntryTarget,
  getCharadesControlsDeviceTarget,
  getCharadesSettingsEntryTarget,
  getCharadesSettingsTabTarget,
  getNextTargetInList,
} from './charades-navigation-targets'

type CharadesSettingsNavigationContext = {
  activeCategoryId: CharadesSettingsCategoryId
  activeControlsDevice: CharadesControlsDevice
  visibleBindingIds: string[]
  isListeningBinding: boolean
}

const SETTINGS_CATEGORY_ORDER: CharadesSettingsCategoryId[] = ['general', 'audio', 'controls']
const CONTROLS_DEVICE_ORDER: CharadesControlsDevice[] = ['keyboard', 'controller']
const SETTINGS_FOOTER_ORDER = [
  CHARADES_NAVIGATION_TARGETS.settingsFooterReset,
  CHARADES_NAVIGATION_TARGETS.settingsFooterSave,
] as const

export const charadesSettingsNavigationProfile: HostNavigationProfile<CharadesSettingsNavigationContext> = {
  screenId: CHARADES_NAVIGATION_SCREENS.settings,
  getEntryTarget: (context) => getCharadesSettingsEntryTarget(context.activeCategoryId),
  resolveAction: ({ context, current, action }) => {
    const currentTabTarget = getCharadesSettingsTabTarget(context.activeCategoryId)

    if (action === 'next' || action === 'previous') {
      if (context.isListeningBinding) {
        return { type: 'stay' }
      }

      const nextCategory = getNextTargetInList(
        SETTINGS_CATEGORY_ORDER,
        context.activeCategoryId,
        action === 'previous' ? -1 : 1,
      )

      return {
        type: 'delegate',
        commandId: `${CHARADES_NAVIGATION_COMMANDS.settingsSelectCategory}:${nextCategory}`,
      }
    }

    if (current.zoneId === CHARADES_NAVIGATION_ZONES.tabs) {
      if (action === 'left' && current.targetId === CHARADES_NAVIGATION_TARGETS.settingsTabGeneral) {
        return {
          type: 'move',
          zoneId: CHARADES_NAVIGATION_ZONES.rail,
          targetId: CHARADES_NAVIGATION_TARGETS.railSettingsLink,
        }
      }

      if (action === 'down') {
        const entryTarget = getCharadesSettingsEntryTarget(context.activeCategoryId)
        return {
          type: 'move',
          zoneId: entryTarget.zoneId,
          targetId: entryTarget.targetId,
        }
      }

      return { type: 'stay' }
    }

    if (current.zoneId === CHARADES_NAVIGATION_ZONES.content) {
      if (action === 'up') {
        return {
          type: 'move',
          zoneId: CHARADES_NAVIGATION_ZONES.tabs,
          targetId: currentTabTarget,
        }
      }

      return { type: 'stay' }
    }

    if (current.zoneId === CHARADES_NAVIGATION_ZONES.device) {
      if (action === 'left') {
        if (current.targetId === CHARADES_NAVIGATION_TARGETS.settingsKeyboardDevice) {
          return {
            type: 'move',
            zoneId: CHARADES_NAVIGATION_ZONES.rail,
            targetId: CHARADES_NAVIGATION_TARGETS.railSettingsLink,
          }
        }

        return {
          type: 'move',
          zoneId: CHARADES_NAVIGATION_ZONES.device,
          targetId: getCharadesControlsDeviceTarget(
            getNextTargetInList(CONTROLS_DEVICE_ORDER, context.activeControlsDevice, -1),
          ),
        }
      }

      if (action === 'right') {
        return {
          type: 'move',
          zoneId: CHARADES_NAVIGATION_ZONES.device,
          targetId: getCharadesControlsDeviceTarget(
            getNextTargetInList(CONTROLS_DEVICE_ORDER, context.activeControlsDevice, 1),
          ),
        }
      }

      if (action === 'down') {
        const nextBindingsTarget = getCharadesBindingsEntryTarget(context.visibleBindingIds)
        return {
          type: 'move',
          zoneId: nextBindingsTarget.zoneId,
          targetId: nextBindingsTarget.targetId,
        }
      }

      if (action === 'up') {
        return {
          type: 'move',
          zoneId: CHARADES_NAVIGATION_ZONES.tabs,
          targetId: currentTabTarget,
        }
      }

      return { type: 'stay' }
    }

    if (current.zoneId === CHARADES_NAVIGATION_ZONES.bindings) {
      if (action === 'up') {
        if (current.targetId === context.visibleBindingIds[0]) {
          return {
            type: 'move',
            zoneId: CHARADES_NAVIGATION_ZONES.device,
            targetId: getCharadesControlsDeviceTarget(context.activeControlsDevice),
          }
        }

        return {
          type: 'move',
          zoneId: CHARADES_NAVIGATION_ZONES.bindings,
          targetId: getNextTargetInList(context.visibleBindingIds, current.targetId, -1),
        }
      }

      if (action === 'down') {
        if (current.targetId === context.visibleBindingIds[context.visibleBindingIds.length - 1]) {
          return {
            type: 'move',
            zoneId: CHARADES_NAVIGATION_ZONES.footer,
            targetId: CHARADES_NAVIGATION_TARGETS.settingsFooterReset,
          }
        }

        return {
          type: 'move',
          zoneId: CHARADES_NAVIGATION_ZONES.bindings,
          targetId: getNextTargetInList(context.visibleBindingIds, current.targetId, 1),
        }
      }

      if (action === 'confirm' || action === 'primary') {
        return {
          type: 'delegate',
          commandId: CHARADES_NAVIGATION_COMMANDS.settingsStartBindingListen,
        }
      }

      return { type: 'stay' }
    }

    if (current.zoneId === CHARADES_NAVIGATION_ZONES.footer) {
      if (action === 'left' || action === 'right') {
        return {
          type: 'move',
          zoneId: CHARADES_NAVIGATION_ZONES.footer,
          targetId: getNextTargetInList(
            SETTINGS_FOOTER_ORDER,
            current.targetId as (typeof SETTINGS_FOOTER_ORDER)[number],
            action === 'left' ? -1 : 1,
          ),
        }
      }

      if (action === 'up') {
        const nextBindingsTarget = getCharadesBindingsEntryTarget(context.visibleBindingIds)
        return {
          type: 'move',
          zoneId: nextBindingsTarget.zoneId,
          targetId: nextBindingsTarget.targetId,
        }
      }

      if (action === 'confirm' || action === 'primary') {
        return {
          type: 'delegate',
          commandId:
            current.targetId === CHARADES_NAVIGATION_TARGETS.settingsFooterReset
              ? CHARADES_NAVIGATION_COMMANDS.settingsResetBindings
              : CHARADES_NAVIGATION_COMMANDS.settingsSaveBindings,
        }
      }
    }

    if (action === 'back' || action === 'menu' || action === 'secondary') {
      return {
        type: 'delegate',
        commandId: CHARADES_NAVIGATION_COMMANDS.settingsExitToMenu,
      }
    }

    return { type: 'stay' }
  },
}

export type { CharadesSettingsNavigationContext }

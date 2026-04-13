import type { HostNavigationProfile } from '@party/game-sdk'
import type { CodenamesControlsDevice, CodenamesSettingsCategoryId } from '../menu/codenames-settings-overlay-data'
import { CODENAMES_NAVIGATION_COMMANDS } from './codenames-navigation-actions'
import {
  CODENAMES_NAVIGATION_TARGETS,
  CODENAMES_NAVIGATION_SCREENS,
  CODENAMES_NAVIGATION_ZONES,
  getCodenamesBindingsEntryTarget,
  getCodenamesControlsDeviceTarget,
  getCodenamesSettingsEntryTarget,
  getCodenamesSettingsTabTarget,
  getNextTargetInList,
} from './codenames-navigation-targets'

type CodenamesSettingsNavigationContext = {
  activeCategoryId: CodenamesSettingsCategoryId
  activeControlsDevice: CodenamesControlsDevice
  visibleBindingIds: string[]
  isListeningBinding: boolean
}

const SETTINGS_CATEGORY_ORDER: CodenamesSettingsCategoryId[] = ['general', 'audio', 'controls']
const CONTROLS_DEVICE_ORDER: CodenamesControlsDevice[] = ['keyboard', 'controller']
const SETTINGS_FOOTER_ORDER = [
  CODENAMES_NAVIGATION_TARGETS.settingsFooterReset,
  CODENAMES_NAVIGATION_TARGETS.settingsFooterSave,
] as const

export const codenamesSettingsNavigationProfile: HostNavigationProfile<CodenamesSettingsNavigationContext> = {
  screenId: CODENAMES_NAVIGATION_SCREENS.settings,
  getEntryTarget: (context) => getCodenamesSettingsEntryTarget(context.activeCategoryId),
  resolveAction: ({ context, current, action }) => {
    const currentTabTarget = getCodenamesSettingsTabTarget(context.activeCategoryId)

    if (action === 'next' || action === 'previous') {
      if (context.isListeningBinding) return { type: 'stay' }
      const nextCategory = getNextTargetInList(
        SETTINGS_CATEGORY_ORDER,
        context.activeCategoryId,
        action === 'previous' ? -1 : 1,
      )
      return { type: 'delegate', commandId: `${CODENAMES_NAVIGATION_COMMANDS.settingsSelectCategory}:${nextCategory}` }
    }

    if (current.zoneId === CODENAMES_NAVIGATION_ZONES.tabs) {
      if (action === 'left' && current.targetId === CODENAMES_NAVIGATION_TARGETS.settingsTabGeneral) {
        return { type: 'move', zoneId: CODENAMES_NAVIGATION_ZONES.rail, targetId: CODENAMES_NAVIGATION_TARGETS.railSettingsLink }
      }
      if (action === 'down') {
        const entry = getCodenamesSettingsEntryTarget(context.activeCategoryId)
        return { type: 'move', zoneId: entry.zoneId, targetId: entry.targetId }
      }
      return { type: 'stay' }
    }

    if (current.zoneId === CODENAMES_NAVIGATION_ZONES.content) {
      if (action === 'up') return { type: 'move', zoneId: CODENAMES_NAVIGATION_ZONES.tabs, targetId: currentTabTarget }
      return { type: 'stay' }
    }

    if (current.zoneId === CODENAMES_NAVIGATION_ZONES.device) {
      if (action === 'left') {
        if (current.targetId === CODENAMES_NAVIGATION_TARGETS.settingsKeyboardDevice) {
          return { type: 'move', zoneId: CODENAMES_NAVIGATION_ZONES.rail, targetId: CODENAMES_NAVIGATION_TARGETS.railSettingsLink }
        }
        return {
          type: 'move',
          zoneId: CODENAMES_NAVIGATION_ZONES.device,
          targetId: getCodenamesControlsDeviceTarget(getNextTargetInList(CONTROLS_DEVICE_ORDER, context.activeControlsDevice, -1)),
        }
      }
      if (action === 'right') {
        return {
          type: 'move',
          zoneId: CODENAMES_NAVIGATION_ZONES.device,
          targetId: getCodenamesControlsDeviceTarget(getNextTargetInList(CONTROLS_DEVICE_ORDER, context.activeControlsDevice, 1)),
        }
      }
      if (action === 'down') {
        const next = getCodenamesBindingsEntryTarget(context.visibleBindingIds)
        return { type: 'move', zoneId: next.zoneId, targetId: next.targetId }
      }
      if (action === 'up') return { type: 'move', zoneId: CODENAMES_NAVIGATION_ZONES.tabs, targetId: currentTabTarget }
      return { type: 'stay' }
    }

    if (current.zoneId === CODENAMES_NAVIGATION_ZONES.bindings) {
      if (action === 'up') {
        if (current.targetId === context.visibleBindingIds[0]) {
          return { type: 'move', zoneId: CODENAMES_NAVIGATION_ZONES.device, targetId: getCodenamesControlsDeviceTarget(context.activeControlsDevice) }
        }
        return { type: 'move', zoneId: CODENAMES_NAVIGATION_ZONES.bindings, targetId: getNextTargetInList(context.visibleBindingIds, current.targetId, -1) }
      }
      if (action === 'down') {
        if (current.targetId === context.visibleBindingIds[context.visibleBindingIds.length - 1]) {
          return { type: 'move', zoneId: CODENAMES_NAVIGATION_ZONES.footer, targetId: CODENAMES_NAVIGATION_TARGETS.settingsFooterReset }
        }
        return { type: 'move', zoneId: CODENAMES_NAVIGATION_ZONES.bindings, targetId: getNextTargetInList(context.visibleBindingIds, current.targetId, 1) }
      }
      if (action === 'confirm' || action === 'primary') {
        return { type: 'delegate', commandId: CODENAMES_NAVIGATION_COMMANDS.settingsStartBindingListen }
      }
      return { type: 'stay' }
    }

    if (current.zoneId === CODENAMES_NAVIGATION_ZONES.footer) {
      if (action === 'left' || action === 'right') {
        return {
          type: 'move',
          zoneId: CODENAMES_NAVIGATION_ZONES.footer,
          targetId: getNextTargetInList(
            SETTINGS_FOOTER_ORDER,
            current.targetId as (typeof SETTINGS_FOOTER_ORDER)[number],
            action === 'left' ? -1 : 1,
          ),
        }
      }
      if (action === 'up') {
        const next = getCodenamesBindingsEntryTarget(context.visibleBindingIds)
        return { type: 'move', zoneId: next.zoneId, targetId: next.targetId }
      }
      if (action === 'confirm' || action === 'primary') {
        return {
          type: 'delegate',
          commandId: current.targetId === CODENAMES_NAVIGATION_TARGETS.settingsFooterReset
            ? CODENAMES_NAVIGATION_COMMANDS.settingsResetBindings
            : CODENAMES_NAVIGATION_COMMANDS.settingsSaveBindings,
        }
      }
    }

    if (action === 'back' || action === 'menu' || action === 'secondary') {
      return { type: 'delegate', commandId: CODENAMES_NAVIGATION_COMMANDS.settingsExitToMenu }
    }

    return { type: 'stay' }
  },
}

export type { CodenamesSettingsNavigationContext }

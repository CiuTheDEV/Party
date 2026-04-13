import type { HostNavigationTarget } from '@party/game-sdk'
import type { CodenamesControlsDevice, CodenamesSettingsCategoryId } from '../menu/codenames-settings-overlay-data'

export const CODENAMES_NAVIGATION_SCREENS = {
  menu: 'codenames-menu',
  settings: 'codenames-settings',
  setup: 'codenames-setup',
} as const

export const CODENAMES_NAVIGATION_ZONES = {
  content: 'content',
  rail: 'rail',
  tabs: 'tabs',
  device: 'device',
  bindings: 'bindings',
  footer: 'footer',
  dialog: 'dialog',
} as const

export const CODENAMES_NAVIGATION_TARGETS = {
  menuPlayNow: 'menu-play-now',
  railMenuLink: 'rail-menu-link',
  railSettingsLink: 'rail-settings-link',
  settingsTabGeneral: 'settings-tab-general',
  settingsTabAudio: 'settings-tab-audio',
  settingsTabControls: 'settings-tab-controls',
  settingsGeneralCard: 'settings-general-card',
  settingsAudioCard: 'settings-audio-card',
  settingsKeyboardDevice: 'settings-device-keyboard',
  settingsControllerDevice: 'settings-device-controller',
  settingsFooterReset: 'settings-footer-reset',
  settingsFooterSave: 'settings-footer-save',
  setupClose: 'setup-close',
  setupStart: 'setup-start',
} as const

const CODENAMES_RAIL_HREF_BY_TARGET: Record<string, string> = {
  [CODENAMES_NAVIGATION_TARGETS.railMenuLink]: '/games/codenames',
  [CODENAMES_NAVIGATION_TARGETS.railSettingsLink]: '/games/codenames/settings',
}

export type CodenamesNavigationScreenId = typeof CODENAMES_NAVIGATION_SCREENS[keyof typeof CODENAMES_NAVIGATION_SCREENS]
export type CodenamesNavigationZoneId = typeof CODENAMES_NAVIGATION_ZONES[keyof typeof CODENAMES_NAVIGATION_ZONES]
export type CodenamesNavigationTargetId = typeof CODENAMES_NAVIGATION_TARGETS[keyof typeof CODENAMES_NAVIGATION_TARGETS]

export function getCodenamesMenuEntryTarget(): HostNavigationTarget {
  return { zoneId: CODENAMES_NAVIGATION_ZONES.content, targetId: CODENAMES_NAVIGATION_TARGETS.menuPlayNow }
}

export function getCodenamesRailEntryTarget(activeView: 'mode' | 'settings'): HostNavigationTarget {
  return {
    zoneId: CODENAMES_NAVIGATION_ZONES.rail,
    targetId: activeView === 'settings'
      ? CODENAMES_NAVIGATION_TARGETS.railSettingsLink
      : CODENAMES_NAVIGATION_TARGETS.railMenuLink,
  }
}

export function getCodenamesRailHref(targetId: string): string {
  return CODENAMES_RAIL_HREF_BY_TARGET[targetId] ?? '/games/codenames'
}

export function getCodenamesRailTargetFromHref(href: string): CodenamesNavigationTargetId {
  const match = Object.entries(CODENAMES_RAIL_HREF_BY_TARGET).find(([, v]) => v === href)
  return (match?.[0] as CodenamesNavigationTargetId | undefined) ?? CODENAMES_NAVIGATION_TARGETS.railMenuLink
}

export function getCodenamesSettingsTabTarget(categoryId: CodenamesSettingsCategoryId): CodenamesNavigationTargetId {
  if (categoryId === 'audio') return CODENAMES_NAVIGATION_TARGETS.settingsTabAudio
  if (categoryId === 'controls') return CODENAMES_NAVIGATION_TARGETS.settingsTabControls
  return CODENAMES_NAVIGATION_TARGETS.settingsTabGeneral
}

export function getCodenamesSettingsEntryTarget(categoryId: CodenamesSettingsCategoryId): HostNavigationTarget {
  if (categoryId === 'audio') return { zoneId: CODENAMES_NAVIGATION_ZONES.content, targetId: CODENAMES_NAVIGATION_TARGETS.settingsAudioCard }
  if (categoryId === 'controls') return { zoneId: CODENAMES_NAVIGATION_ZONES.device, targetId: CODENAMES_NAVIGATION_TARGETS.settingsKeyboardDevice }
  return { zoneId: CODENAMES_NAVIGATION_ZONES.content, targetId: CODENAMES_NAVIGATION_TARGETS.settingsGeneralCard }
}

export function getCodenamesControlsDeviceTarget(device: CodenamesControlsDevice): CodenamesNavigationTargetId {
  return device === 'controller'
    ? CODENAMES_NAVIGATION_TARGETS.settingsControllerDevice
    : CODENAMES_NAVIGATION_TARGETS.settingsKeyboardDevice
}

export function getCodenamesBindingsEntryTarget(bindingIds: string[]): HostNavigationTarget {
  return {
    zoneId: CODENAMES_NAVIGATION_ZONES.bindings,
    targetId: bindingIds[0] ?? CODENAMES_NAVIGATION_TARGETS.settingsFooterReset,
  }
}

export function getCodenamesSetupEntryTarget(): HostNavigationTarget {
  return { zoneId: CODENAMES_NAVIGATION_ZONES.dialog, targetId: CODENAMES_NAVIGATION_TARGETS.setupStart }
}

export function getNextTargetInList<T extends string>(items: readonly T[], current: T, direction: -1 | 1): T {
  const currentIndex = items.indexOf(current)
  if (currentIndex < 0) return items[0] ?? current
  const nextIndex = currentIndex + direction
  if (nextIndex < 0 || nextIndex >= items.length) return current
  return items[nextIndex] ?? current
}

import type { HostNavigationTarget } from '@party/game-sdk'
import type { CharadesControlsDevice, CharadesSettingsCategoryId } from '../menu/charades-settings-overlay-data'

export const CHARADES_NAVIGATION_SCREENS = {
  menu: 'charades-menu',
  settings: 'charades-settings',
  setup: 'charades-setup',
  runtime: 'charades-runtime',
} as const

export const CHARADES_NAVIGATION_ZONES = {
  content: 'content',
  rail: 'rail',
  tabs: 'tabs',
  device: 'device',
  bindings: 'bindings',
  footer: 'footer',
  dialog: 'dialog',
  runtime: 'runtime',
  runtimeSettings: 'runtime-settings',
  runtimeSettingsConfirm: 'runtime-settings-confirm',
  verdictPicker: 'verdict-picker',
} as const

export const CHARADES_NAVIGATION_TARGETS = {
  menuPlayNow: 'menu-play-now',
  railMenuLink: 'rail-menu-link',
  railSettingsLink: 'rail-settings-link',
  railRankingsLink: 'rail-rankings-link',
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
  runtimePrimary: 'runtime-primary',
  runtimeVerdictCorrect: 'runtime-verdict-correct',
  runtimeVerdictIncorrect: 'runtime-verdict-incorrect',
  runtimePauseSound: 'runtime-pause-sound',
  runtimePauseAnimations: 'runtime-pause-animations',
  runtimePauseExit: 'runtime-pause-exit',
  runtimePauseContinue: 'runtime-pause-continue',
  runtimePauseConfirmStay: 'runtime-pause-confirm-stay',
  runtimePauseConfirmExit: 'runtime-pause-confirm-exit',
  runtimeVerdictFirstPlayer: 'runtime-verdict-player-first',
  runtimeVerdictCancel: 'runtime-verdict-cancel',
  runtimeVerdictConfirm: 'runtime-verdict-confirm',
} as const

const CHARADES_RAIL_HREF_BY_TARGET: Record<string, string> = {
  [CHARADES_NAVIGATION_TARGETS.railMenuLink]: '/games/charades',
  [CHARADES_NAVIGATION_TARGETS.railSettingsLink]: '/games/charades/settings',
  [CHARADES_NAVIGATION_TARGETS.railRankingsLink]: '/games/charades/rankings',
}

export type CharadesNavigationScreenId =
  typeof CHARADES_NAVIGATION_SCREENS[keyof typeof CHARADES_NAVIGATION_SCREENS]

export type CharadesNavigationZoneId =
  typeof CHARADES_NAVIGATION_ZONES[keyof typeof CHARADES_NAVIGATION_ZONES]

export type CharadesNavigationTargetId =
  typeof CHARADES_NAVIGATION_TARGETS[keyof typeof CHARADES_NAVIGATION_TARGETS]

export function getCharadesMenuEntryTarget(): HostNavigationTarget {
  return {
    zoneId: CHARADES_NAVIGATION_ZONES.content,
    targetId: CHARADES_NAVIGATION_TARGETS.menuPlayNow,
  }
}

export function getCharadesRailEntryTarget(activeView: 'mode' | 'settings'): HostNavigationTarget {
  return {
    zoneId: CHARADES_NAVIGATION_ZONES.rail,
    targetId:
      activeView === 'settings'
        ? CHARADES_NAVIGATION_TARGETS.railSettingsLink
        : CHARADES_NAVIGATION_TARGETS.railMenuLink,
  }
}

export function getCharadesRailHref(targetId: string): string {
  return CHARADES_RAIL_HREF_BY_TARGET[targetId] ?? '/games/charades'
}

export function getCharadesRailTargetFromHref(href: string): CharadesNavigationTargetId {
  const match = Object.entries(CHARADES_RAIL_HREF_BY_TARGET).find(([, value]) => value === href)
  return (match?.[0] as CharadesNavigationTargetId | undefined) ?? CHARADES_NAVIGATION_TARGETS.railMenuLink
}

export function getCharadesSettingsTabTarget(
  categoryId: CharadesSettingsCategoryId,
): CharadesNavigationTargetId {
  if (categoryId === 'audio') {
    return CHARADES_NAVIGATION_TARGETS.settingsTabAudio
  }

  if (categoryId === 'controls') {
    return CHARADES_NAVIGATION_TARGETS.settingsTabControls
  }

  return CHARADES_NAVIGATION_TARGETS.settingsTabGeneral
}

export function getCharadesSettingsEntryTarget(
  categoryId: CharadesSettingsCategoryId,
): HostNavigationTarget {
  if (categoryId === 'audio') {
    return {
      zoneId: CHARADES_NAVIGATION_ZONES.content,
      targetId: CHARADES_NAVIGATION_TARGETS.settingsAudioCard,
    }
  }

  if (categoryId === 'controls') {
    return {
      zoneId: CHARADES_NAVIGATION_ZONES.device,
      targetId: CHARADES_NAVIGATION_TARGETS.settingsKeyboardDevice,
    }
  }

  return {
    zoneId: CHARADES_NAVIGATION_ZONES.content,
    targetId: CHARADES_NAVIGATION_TARGETS.settingsGeneralCard,
  }
}

export function getCharadesControlsDeviceTarget(
  device: CharadesControlsDevice,
): CharadesNavigationTargetId {
  return device === 'controller'
    ? CHARADES_NAVIGATION_TARGETS.settingsControllerDevice
    : CHARADES_NAVIGATION_TARGETS.settingsKeyboardDevice
}

export function getCharadesBindingsEntryTarget(bindingIds: string[]): HostNavigationTarget {
  return {
    zoneId: CHARADES_NAVIGATION_ZONES.bindings,
    targetId: bindingIds[0] ?? CHARADES_NAVIGATION_TARGETS.settingsFooterReset,
  }
}

export function getCharadesSetupEntryTarget(): HostNavigationTarget {
  return {
    zoneId: CHARADES_NAVIGATION_ZONES.dialog,
    targetId: CHARADES_NAVIGATION_TARGETS.setupStart,
  }
}

export function getCharadesRuntimeEntryTarget(): HostNavigationTarget {
  return {
    zoneId: CHARADES_NAVIGATION_ZONES.runtime,
    targetId: CHARADES_NAVIGATION_TARGETS.runtimePrimary,
  }
}

export function getNextTargetInList<T extends string>(
  items: readonly T[],
  current: T,
  direction: -1 | 1,
): T {
  const currentIndex = items.indexOf(current)

  if (currentIndex < 0) {
    return items[0] ?? current
  }

  const nextIndex = currentIndex + direction
  if (nextIndex < 0 || nextIndex >= items.length) {
    return current
  }

  return items[nextIndex] ?? current
}

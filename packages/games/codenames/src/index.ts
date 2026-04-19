import type { GameMenuContentProps, GameModule, GameResultsProps } from '@party/game-sdk'
import type { ComponentType } from 'react'
import { config } from './config'
import { CodenamesMenuContent } from './menu/CodenamesMenuContent'
import { getCodenamesMenuActiveHref, resolveCodenamesMenuViewFromHref } from './menu/menu-view'
import { TeamsSection } from './setup/sections/TeamsSection'
import { SettingsSection } from './setup/sections/SettingsSection'
import { CategoriesSection } from './setup/sections/CategoriesSection'
import { PairingSection } from './setup/sections/PairingSection'
import type { CodenamesSetupHelpers } from './setup/helpers'
import {
  createInitialCodenamesSetupState,
  type CodenamesSetupState,
  validateCodenamesSetup,
} from './setup/state'

function CodenamesResultsFallback(_: GameResultsProps) {
  return null
}

export const codenamesModule: GameModule<CodenamesSetupState, CodenamesSetupHelpers> = {
  config,
  shell: {
    gameName: 'Tajniacy',
    gameEmoji: '\uD83D\uDD75\uFE0F',
    links: [
      { label: 'Menu gry', href: '/games/codenames', icon: 'play' },
      { label: 'Ustawienia', href: '/games/codenames/settings', icon: 'settings' },
    ],
  },
  createInitialSetupState: createInitialCodenamesSetupState,
  setupSections: [
    { id: 'teams', render: TeamsSection, unstyled: true },
    { id: 'settings', render: SettingsSection, unstyled: true },
    { id: 'categories', render: CategoriesSection, unstyled: true },
    { id: 'pairing', render: PairingSection, unstyled: true },
  ],
  validateSetup: validateCodenamesSetup,
  GameMenuContent: CodenamesMenuContent as ComponentType<GameMenuContentProps>,
  GameResults: CodenamesResultsFallback,
}

export { config, createInitialCodenamesSetupState, validateCodenamesSetup }
export { CodenamesMenuContent }
export {
  CODENAMES_NAVIGATION_COMMANDS,
} from './navigation/codenames-navigation-actions'
export {
  CODENAMES_SETUP_STORAGE_KEY,
  restoreCodenamesSetupState,
  serializeCodenamesSetupState,
} from './setup/setup-storage'
export {
  CODENAMES_NAVIGATION_SCREENS,
  CODENAMES_NAVIGATION_TARGETS,
  CODENAMES_NAVIGATION_ZONES,
  getCodenamesBindingsEntryTarget,
  getCodenamesControlsDeviceTarget,
  getCodenamesMenuEntryTarget,
  getCodenamesRailEntryTarget,
  getCodenamesRailHref,
  getCodenamesRailTargetFromHref,
  getCodenamesSettingsEntryTarget,
  getCodenamesSettingsTabTarget,
  getCodenamesSetupEntryTarget,
} from './navigation/codenames-navigation-targets'
export {
  codenamesMenuNavigationProfile,
} from './navigation/codenames-menu-navigation-profile'
export {
  codenamesSettingsNavigationProfile,
} from './navigation/codenames-settings-navigation-profile'
export {
  codenamesSetupNavigationProfile,
} from './navigation/codenames-setup-navigation-profile'
export { useMenuControls } from './menu/useMenuControls'
export { resolveMenuModeCommand } from './menu/menu-controls'
export { getCodenamesMenuActiveHref, resolveCodenamesMenuViewFromHref }
export type { CodenamesMenuView } from './menu/menu-view'
export type { CodenamesNavigationCommandId } from './navigation/codenames-navigation-actions'
export type {
  CodenamesMenuNavigationContext,
} from './navigation/codenames-menu-navigation-profile'
export type {
  CodenamesSettingsNavigationContext,
} from './navigation/codenames-settings-navigation-profile'
export type {
  CodenamesSetupNavigationContext,
} from './navigation/codenames-setup-navigation-profile'
export type {
  CodenamesSetupState,
  CodenamesTeam,
  CodenamesGameSettings,
} from './setup/state'
export type {
  CodenamesSetupHelpers,
  CodenamesWordCategory,
  CaptainListenerProps,
} from './setup/helpers'
export {
  CODENAMES_BOARD_WORD_COUNT,
  appendPoolValidationError,
  getCodenamesCategoryPoolSummaries,
  getCodenamesPoolSummary,
} from './setup/pool-validation'

export { HostGameScreen } from './runtime/host/HostGameScreen'
export { prepareCodenamesGameStart } from './runtime/host/start-game'
export { CaptainScreen } from './runtime/captain/CaptainScreen'
export { getCaptainBoardMeta } from './runtime/captain/board-meta'
export { useCaptainRoomStatus } from './runtime/captain/useCaptainRoomStatus'
export { default as CodenameCaptainListener } from './runtime/setup/CaptainListener'
export { buildCaptainPath, buildCaptainRoutePath } from './runtime/shared/codenames-runtime'
export {
  CODENAMES_WORD_HISTORY_STORAGE_KEY,
  buildCodenamesPoolKey,
  createEmptyCodenamesWordHistory,
  getFreshWordsForCategories,
  getFreshWordsForPool,
  normalizeCodenamesWordHistory,
  readCodenamesWordHistory,
  recordUsedWordsForCategories,
  recordUsedWordsForPool,
  resetCodenamesCategoryHistories,
  resetCodenamesPoolHistory,
  writeCodenamesWordHistory,
} from './runtime/shared/codenames-word-history'
export {
  getCaptainRuntimeStatus,
  getHostRuntimeStatus,
  shouldWarnBeforeUnload,
} from './runtime/shared/runtime-status'

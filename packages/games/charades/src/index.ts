export { AvatarAsset } from '@party/ui'
export {
  getPartyAvatarById as getCharadesAvatarById,
  getPartyAvatarCategories as getCharadesAvatarCategories,
  getPartyAvatarsByCategory as getCharadesAvatarsByCategory,
  normalizePartyAvatarId as normalizeCharadesAvatarId,
  normalizePartyPlayers as normalizeCharadesPlayers,
} from '@party/ui'
import type { GameMenuContentProps, GameModule, GameResultsProps } from '@party/game-sdk'
import type { ComponentType } from 'react'
import { config } from './config'
import { CharadesMenuContent } from './menu/CharadesMenuContent'
import { getCharadesMenuActiveHref, resolveCharadesMenuViewFromHref } from './menu/menu-view'
import { CharadesResults } from './results/CharadesResults'
import { CategoriesSection } from './setup/sections/CategoriesSection'
import { PairingSection } from './setup/sections/PairingSection'
import { PlayersSection } from './setup/sections/PlayersSection'
import { SettingsSection } from './setup/sections/SettingsSection'
import type { CharadesSetupHelpers } from './setup/helpers'
import {
  createInitialCharadesSetupState,
  type CharadesSetupState,
  validateCharadesSetup,
} from './setup/state'
import type { CharadesResultPlayer } from './results/types'

function CharadesResultsScreen(props: GameResultsProps & { players?: CharadesResultPlayer[] }) {
  return CharadesResults({
    players: props.players ?? [],
    onPlayAgain: props.onPlayAgain,
    onBackToMenu: props.onBackToMenu,
  })
}

function CharadesResultsFallback(_: GameResultsProps) {
  return null
}

export const charadesModule: GameModule<CharadesSetupState, CharadesSetupHelpers> = {
  config,
  shell: {
    gameName: 'Kalambury',
    gameEmoji: '\uD83C\uDFAD',
    links: [
      { label: 'Menu gry', href: '/games/charades', icon: 'play' },
      { label: 'Ustawienia', href: '/games/charades/settings', icon: 'settings' },
      { label: 'Rankingi', href: '/games/charades/rankings', icon: 'rankings', disabled: true },
    ],
  },
  createInitialSetupState: createInitialCharadesSetupState,
  setupSections: [
    { id: 'players', render: PlayersSection, unstyled: true },
    { id: 'settings', render: SettingsSection, unstyled: true },
    { id: 'categories', render: CategoriesSection, unstyled: true },
    { id: 'pairing', render: PairingSection, unstyled: true },
  ],
  validateSetup: validateCharadesSetup,
  GameMenuContent: CharadesMenuContent as ComponentType<GameMenuContentProps>,
  GameResults: CharadesResultsFallback,
}

export { config, createInitialCharadesSetupState, validateCharadesSetup }
export { CharadesResultsScreen }
export { CharadesMenuContent }
export {
  CHARADES_NAVIGATION_COMMANDS,
} from './navigation/charades-navigation-actions'
export {
  CHARADES_NAVIGATION_SCREENS,
  CHARADES_NAVIGATION_TARGETS,
  CHARADES_NAVIGATION_ZONES,
  getCharadesBindingsEntryTarget,
  getCharadesControlsDeviceTarget,
  getCharadesMenuEntryTarget,
  getCharadesRailEntryTarget,
  getCharadesRailHref,
  getCharadesRailTargetFromHref,
  getCharadesRuntimeEntryTarget,
  getCharadesSettingsEntryTarget,
  getCharadesSettingsTabTarget,
  getCharadesSetupEntryTarget,
} from './navigation/charades-navigation-targets'
export {
  charadesMenuNavigationProfile,
} from './navigation/charades-menu-navigation-profile'
export {
  charadesSettingsNavigationProfile,
} from './navigation/charades-settings-navigation-profile'
export {
  charadesSetupNavigationProfile,
} from './navigation/charades-setup-navigation-profile'
export {
  charadesRuntimeNavigationProfile,
} from './navigation/charades-runtime-navigation-profile'
export { useMenuControls } from './menu/useMenuControls'
export { resolveMenuModeCommand, getNextMenuModeFocus, getNextRailFocusHref } from './menu/menu-controls'
export { getCurrentGamepadInputLabel, listConnectedGamepads, pickPreferredGamepad } from './menu/charades-controls-bindings'
export { default as CharadesDeviceListener } from './runtime/setup/DeviceListener'
export { HostGameScreen } from './runtime/play/HostGameScreen'
export { PresenterScreen } from './runtime/presenter/PresenterScreen'
export { useGameState } from './runtime/hooks/useGameState'
export { usePresenter } from './runtime/hooks/usePresenter'
export { useWordPool } from './runtime/hooks/useWordPool'
export { getCharadesMenuActiveHref, resolveCharadesMenuViewFromHref }
export type { CharadesMenuView } from './menu/menu-view'
export type { CharadesNavigationCommandId } from './navigation/charades-navigation-actions'
export type {
  CharadesMenuNavigationContext,
} from './navigation/charades-menu-navigation-profile'
export type {
  CharadesRuntimeNavigationContext,
} from './navigation/charades-runtime-navigation-profile'
export type {
  CharadesSettingsNavigationContext,
} from './navigation/charades-settings-navigation-profile'
export type {
  CharadesSetupNavigationContext,
} from './navigation/charades-setup-navigation-profile'
export { buildPromptPool, buildCategoryPromptPool } from './runtime/hooks/word-pool-helpers'
export {
  getRemainingPromptCount,
  getRemainingUniqueWordCount,
  getTotalUniqueWordCount,
} from './runtime/hooks/word-history-helpers'
export { openCharadesPoolManager } from './setup/components/CategoryPicker'
export {
  normalizeCharadesSettings,
  ensureCharadesWordHistorySession,
  startNewCharadesWordHistorySession,
  readCharadesWordHistory,
  writeCharadesWordHistory,
  clearCharadesWordHistory,
  clearPresenterSession,
  createCharadesRoomId,
  getPresenterHeartbeatMs,
  isPresenterSessionFresh,
  readCharadesSetup,
  readPresenterSession,
  writeCharadesSetup,
  writePresenterSession,
} from './runtime/shared/charades-storage'
export { getPartykitHost, getPresenterOrigin, isLocalPresenterOrigin } from './runtime/shared/charades-runtime'
export type {
  CharadesAvatarId,
  CharadesCategoryDifficulty,
  CharadesGameSettings,
  CharadesPlayerDraft,
  CharadesSelectedCategories,
  CharadesSetupState,
} from './setup/state'
export type { CharadesResultPlayer } from './results/types'
export type { GameSettings, Player } from './runtime/hooks/useGameState'
export type {
  CharadesDeviceListenerProps,
  CharadesSetupHelpers,
  CharadesWordCategory,
} from './setup/helpers'

import type { GameModule, GameResultsProps } from '@party/game-sdk'
import { config } from './config'
import { CharadesMenuContent } from './menu/CharadesMenuContent'
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
      { label: 'Ustawienia', href: '/games/charades/settings', icon: 'settings', disabled: true },
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
  GameMenuContent: CharadesMenuContent,
  GameResults: CharadesResultsFallback,
}

export { config, createInitialCharadesSetupState, validateCharadesSetup }
export { CharadesResultsScreen }
export { default as CharadesDeviceListener } from './runtime/setup/DeviceListener'
export { HostGameScreen } from './runtime/play/HostGameScreen'
export { PresenterScreen } from './runtime/presenter/PresenterScreen'
export { useGameState } from './runtime/hooks/useGameState'
export { usePresenter } from './runtime/hooks/usePresenter'
export { useWordPool } from './runtime/hooks/useWordPool'
export {
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

import type { HostEvent } from '../shared/charades-events'
import type { GameSettings, GameState } from './game-state-model'
import { buildPreparedTurnState, getPendingTurnDescriptor } from './game-state-transitions'
import { resolveWordChangeRequest } from './word-change-helpers'
import { toPlayerHistoryKey } from './word-history-helpers'
import type { TurnPrompt } from './word-pool-helpers'

type NextWordResolver = (playerKey: string) => TurnPrompt

export type PendingTurnStart = {
  turnId: string
  nextState: GameState
  hostEvent: Extract<HostEvent, { type: 'TURN_START' }>
}

export function createPendingTurnStart({
  state,
  settings,
  getNextWord,
  createTurnId,
}: {
  state: GameState
  settings: GameSettings
  getNextWord: NextWordResolver
  createTurnId: () => string
}): PendingTurnStart | null {
  if (state.phase !== 'prepare' || state.currentWord !== '' || state.order.length === 0) {
    return null
  }

  const pendingTurn = getPendingTurnDescriptor(state)

  if (!pendingTurn) {
    return null
  }

  const playerKey = toPlayerHistoryKey(pendingTurn.presenter)
  const nextPrompt = getNextWord(playerKey)
  const turnId = createTurnId()
  const presenterIdx = state.order[state.currentOrderIdx]

  return {
    turnId,
    nextState: buildPreparedTurnState(state, settings, nextPrompt),
    hostEvent: {
      type: 'TURN_START',
      turnId,
      word: nextPrompt.word,
      category: nextPrompt.category,
      difficulty: nextPrompt.difficulty,
      canChangeWord: settings.wordChange.enabled,
      remainingWordChanges: state.remainingWordChangesByPlayer[presenterIdx] ?? 0,
      presenterName: pendingTurn.presenter.name,
      timerSeconds: settings.timerSeconds,
      nextPresenterName: pendingTurn.nextPresenter.name,
      nextPresenterAvatar: pendingTurn.nextPresenter.avatar,
      nextStep: pendingTurn.nextStep,
    },
  }
}

export type PendingWordChange = {
  playerKey: string
  rejectedPrompt: TurnPrompt
  nextState: GameState
  hostEvent: Extract<HostEvent, { type: 'WORD_CHANGED' }>
}

export function resolvePendingWordChange({
  state,
  settings,
  currentTurnId,
  requestedTurnId,
  getWordOnlyReroll,
  getWordAndCategoryReroll,
}: {
  state: GameState
  settings: GameSettings
  currentTurnId: string
  requestedTurnId: string
  getWordOnlyReroll: (params: {
    playerKey: string
    currentPrompt: TurnPrompt
    rejectedPromptKeysThisTurn: string[]
  }) => TurnPrompt | null
  getWordAndCategoryReroll: (params: {
    playerKey: string
    currentPrompt: TurnPrompt
    rejectedPromptKeysThisTurn: string[]
  }) => TurnPrompt | null
}): PendingWordChange | null {
  if (
    state.phase !== 'reveal-buffer' ||
    requestedTurnId !== currentTurnId ||
    !settings.wordChange.enabled ||
    state.currentDifficulty === ''
  ) {
    return null
  }

  const presenterIdx = state.order[state.currentOrderIdx]
  const presenter = presenterIdx === undefined ? undefined : state.players[presenterIdx]
  const playerKey = presenter ? toPlayerHistoryKey(presenter) : ''
  const currentPrompt: TurnPrompt = {
    word: state.currentWord,
    category: state.currentCategory,
    difficulty: state.currentDifficulty,
  }
  const nextPrompt =
    settings.wordChange.rerollScope === 'word-only'
      ? getWordOnlyReroll({
          playerKey,
          currentPrompt,
          rejectedPromptKeysThisTurn: state.rejectedPromptKeysThisTurn,
        })
      : getWordAndCategoryReroll({
          playerKey,
          currentPrompt,
          rejectedPromptKeysThisTurn: state.rejectedPromptKeysThisTurn,
        })
  const result = resolveWordChangeRequest({
    state,
    settings,
    currentTurnId,
    requestedTurnId,
    nextPrompt,
  })

  if (!result.sync) {
    return null
  }

  return {
    playerKey,
    rejectedPrompt: currentPrompt,
    nextState: result.nextState,
    hostEvent: {
      type: 'WORD_CHANGED',
      turnId: requestedTurnId,
      word: result.sync.word,
      category: result.sync.category,
      difficulty: result.sync.difficulty,
      remainingWordChanges: result.sync.remainingWordChanges,
    },
  }
}

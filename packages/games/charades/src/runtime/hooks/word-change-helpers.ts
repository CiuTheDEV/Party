import { toPromptKey } from './word-history-helpers'
import type { GameSettings, GameState } from './game-state-model'
import type { TurnPrompt } from './word-pool-helpers'

export type WordChangeSync = TurnPrompt & {
  remainingWordChanges: number
}

export function resolveWordChangeRequest({
  state,
  settings,
  currentTurnId,
  requestedTurnId,
  nextPrompt,
}: {
  state: GameState
  settings: GameSettings
  currentTurnId: string
  requestedTurnId: string
  nextPrompt: TurnPrompt | null
}): {
  nextState: GameState
  sync: WordChangeSync | null
} {
  if (
    state.phase !== 'reveal-buffer' ||
    currentTurnId !== requestedTurnId ||
    !settings.wordChange.enabled ||
    nextPrompt === null
  ) {
    return { nextState: state, sync: null }
  }

  const presenterIdx = state.order[state.currentOrderIdx]

  if (presenterIdx === undefined) {
    return { nextState: state, sync: null }
  }

  const remainingWordChanges = state.remainingWordChangesByPlayer[presenterIdx] ?? 0

  if (remainingWordChanges <= 0) {
    return { nextState: state, sync: null }
  }

  const nextRemainingWordChanges = remainingWordChanges - 1
  const rejectedPromptKey =
    state.currentDifficulty === ''
      ? null
      : toPromptKey({
          word: state.currentWord,
          category: state.currentCategory,
          difficulty: state.currentDifficulty,
        })
  const nextState: GameState = {
    ...state,
    currentWord: nextPrompt.word,
    currentCategory: nextPrompt.category,
    currentDifficulty: nextPrompt.difficulty,
    rejectedPromptKeysThisTurn: rejectedPromptKey
      ? [...state.rejectedPromptKeysThisTurn, rejectedPromptKey]
      : state.rejectedPromptKeysThisTurn,
    remainingWordChangesByPlayer: state.remainingWordChangesByPlayer.map((value, index) =>
      index === presenterIdx ? nextRemainingWordChanges : value,
    ),
  }

  return {
    nextState,
    sync: {
      ...nextPrompt,
      remainingWordChanges: nextRemainingWordChanges,
    },
  }
}

import {
  GameSettings,
  GameState,
  Player,
  REVEAL_BUFFER_SECONDS,
  getNextPresenter,
  shuffle,
} from './game-state-model'

const CLEARED_WORD: Pick<GameState, 'currentWord' | 'currentCategory' | 'currentDifficulty'> = {
  currentWord: '',
  currentCategory: '',
  currentDifficulty: '',
}

export type PreparedTurnState = {
  word: string
  category: string
  difficulty: GameState['currentDifficulty']
}

export function buildRoundStartState(current: GameState, settings: GameSettings): GameState {
  return {
    ...current,
    order: shuffle(current.players.map((_, index) => index)),
    rejectedPromptKeysThisTurn: [],
    isRoundOrderRevealing: true,
    currentOrderIdx: 0,
    ...CLEARED_WORD,
    verdictReason: null,
    bufferRemaining: REVEAL_BUFFER_SECONDS,
    timerRemaining: settings.timerSeconds,
  }
}

export function buildRoundOrderFinishedState(current: GameState, settings: GameSettings): GameState {
  return {
    ...current,
    phase: 'prepare',
    rejectedPromptKeysThisTurn: [],
    isRoundOrderRevealing: false,
    currentOrderIdx: 0,
    ...CLEARED_WORD,
    verdictReason: null,
    bufferRemaining: REVEAL_BUFFER_SECONDS,
    timerRemaining: settings.timerSeconds,
  }
}

export function buildPreparedTurnState(
  current: GameState,
  settings: GameSettings,
  preparedTurn: PreparedTurnState,
): GameState {
  return {
    ...current,
    rejectedPromptKeysThisTurn: [],
    currentWord: preparedTurn.word,
    currentCategory: preparedTurn.category,
    currentDifficulty: preparedTurn.difficulty,
    verdictReason: null,
    timerRemaining: settings.timerSeconds,
    bufferRemaining: REVEAL_BUFFER_SECONDS,
  }
}

export function buildStoppedRoundState(current: GameState): GameState {
  return {
    ...current,
    phase: 'verdict',
    rejectedPromptKeysThisTurn: [],
    timerRemaining: Math.max(current.timerRemaining, 0),
    verdictReason: 'manual-stop',
  }
}

export type VerdictTransitionResult = {
  nextState: GameState
  betweenTurns?: {
    presenterName: string
    presenterAvatar: string
  }
  shouldEndGame: boolean
}

export function buildVerdictState(
  current: GameState,
  settings: GameSettings,
  correct: boolean,
  guessedPlayerIdx?: number,
  guessElapsedSeconds?: number,
): VerdictTransitionResult {
  const winnerIdx = correct ? guessedPlayerIdx : undefined
  const updatedPlayers = current.players.map((player, index) =>
    index === winnerIdx
      ? {
          ...player,
          score: player.score + 1,
          totalGuessTimeSeconds: player.totalGuessTimeSeconds + (guessElapsedSeconds ?? 0),
          lastCorrectGuessSeconds: guessElapsedSeconds ?? null,
          lastScoredRound: current.currentRound,
        }
      : player,
  )

  const isLastInRound = current.currentOrderIdx === current.order.length - 1
  const isGameEnding = current.currentRound === current.totalRounds && isLastInRound

  if (!isLastInRound) {
    const nextPresenterIdx = current.order[current.currentOrderIdx + 1]
    const nextPresenter = updatedPlayers[nextPresenterIdx]

    return {
      shouldEndGame: false,
      betweenTurns: {
        presenterName: nextPresenter?.name ?? '',
        presenterAvatar: nextPresenter?.avatar ?? '',
      },
      nextState: {
        ...current,
        players: updatedPlayers,
        phase: 'prepare',
        rejectedPromptKeysThisTurn: [],
        currentOrderIdx: current.currentOrderIdx + 1,
        ...CLEARED_WORD,
        verdictReason: null,
        bufferRemaining: REVEAL_BUFFER_SECONDS,
        timerRemaining: settings.timerSeconds,
      },
    }
  }

  if (!isGameEnding) {
    return {
      shouldEndGame: false,
      nextState: {
        ...current,
        players: updatedPlayers,
        phase: 'round-summary',
        rejectedPromptKeysThisTurn: [],
        isRoundOrderRevealing: false,
        currentOrderIdx: 0,
        ...CLEARED_WORD,
        verdictReason: null,
        bufferRemaining: REVEAL_BUFFER_SECONDS,
        timerRemaining: settings.timerSeconds,
      },
    }
  }

  return {
    shouldEndGame: true,
    nextState: {
      ...current,
      players: updatedPlayers,
      phase: 'verdict',
      rejectedPromptKeysThisTurn: [],
      currentRound: current.currentRound + 1,
      ...CLEARED_WORD,
      verdictReason: null,
      bufferRemaining: 0,
    },
  }
}

export function buildRoundSummaryFinishedState(current: GameState, settings: GameSettings): GameState {
  return {
    ...current,
    phase: 'round-order',
    rejectedPromptKeysThisTurn: [],
    order: [],
    isRoundOrderRevealing: false,
    currentOrderIdx: 0,
    currentRound: current.currentRound + 1,
    ...CLEARED_WORD,
    verdictReason: null,
    bufferRemaining: REVEAL_BUFFER_SECONDS,
    timerRemaining: settings.timerSeconds,
  }
}

export type PendingTurnDescriptor = {
  presenter: Player
  nextPresenter: {
    name: string
    avatar: string
  }
  nextStep: 'next-presenter' | 'round-summary' | 'game-end'
}

export function getPendingTurnDescriptor(state: GameState): PendingTurnDescriptor | null {
  if (state.order.length === 0) {
    return null
  }

  const presenterIdx = state.order[state.currentOrderIdx]
  const presenter = state.players[presenterIdx]

  if (!presenter) {
    return null
  }

  const nextPresenter = getNextPresenter(state.order, state.currentOrderIdx, state.players)
  const isLastInRound = state.currentOrderIdx === state.order.length - 1
  const nextStep = isLastInRound
    ? state.currentRound === state.totalRounds
      ? 'game-end'
      : 'round-summary'
    : 'next-presenter'

  return {
    presenter,
    nextPresenter,
    nextStep,
  }
}

import type { PresenterViewState } from '../presenter/types'
import type { HostEvent, RoomState } from '../shared/charades-events'

export const INITIAL_PRESENTER_STATE: PresenterViewState = {
  phase: 'waiting',
  currentTurnId: '',
  word: '',
  category: '',
  difficulty: '',
  canChangeWord: false,
  remainingWordChanges: 0,
  presenterName: '',
  timerRemaining: 0,
  timerDuration: 0,
  revealRemaining: 0,
  revealDuration: 0,
  nextPresenterName: '',
  nextPresenterAvatar: '',
  nextStep: 'next-presenter',
  turnEndReason: 'none',
}

function buildRoundOrderPresenterState(): PresenterViewState {
  return {
    ...INITIAL_PRESENTER_STATE,
    phase: 'round-order',
  }
}

function clearLiveEventTurnFields(state: PresenterViewState, overrides: Partial<PresenterViewState>): PresenterViewState {
  return {
    ...state,
    word: '',
    difficulty: '',
    canChangeWord: false,
    remainingWordChanges: 0,
    revealRemaining: 0,
    ...overrides,
  }
}

function mapActiveRoomState(roomState: RoomState): PresenterViewState {
  return {
    phase: roomState.presenterPhase === 'timeout' ? 'awaiting-verdict' : roomState.presenterPhase,
    currentTurnId: roomState.currentTurnId,
    word: roomState.currentWord,
    category: roomState.currentCategory,
    difficulty: roomState.currentDifficulty,
    canChangeWord: roomState.canChangeWord,
    remainingWordChanges: roomState.remainingWordChanges,
    presenterName: roomState.currentPresenter,
    timerRemaining: roomState.timerRemaining,
    timerDuration: roomState.timerDuration,
    revealRemaining: roomState.revealRemaining,
    revealDuration: roomState.revealDuration,
    nextPresenterName: roomState.nextPresenterName,
    nextPresenterAvatar: roomState.nextPresenterAvatar,
    nextStep: roomState.nextStep,
    turnEndReason: roomState.turnEndReason,
  }
}

export function applyPresenterHostEvent(state: PresenterViewState, event: HostEvent): PresenterViewState {
  switch (event.type) {
    case 'ROUND_ORDER_START':
      return buildRoundOrderPresenterState()
    case 'TURN_START':
      return {
        ...INITIAL_PRESENTER_STATE,
        phase: 'your-turn',
        currentTurnId: event.turnId,
        word: event.word,
        category: event.category,
        difficulty: event.difficulty,
        canChangeWord: event.canChangeWord,
        remainingWordChanges: event.remainingWordChanges,
        presenterName: event.presenterName,
        timerRemaining: event.timerSeconds,
        timerDuration: event.timerSeconds,
        nextPresenterName: event.nextPresenterName,
        nextPresenterAvatar: event.nextPresenterAvatar,
        nextStep: event.nextStep,
      }
    case 'REVEAL_BUFFER_START':
    case 'REVEAL_BUFFER_TICK':
      if (event.turnId !== state.currentTurnId) {
        return state
      }

      return {
        ...state,
        phase: 'reveal-buffer',
        revealRemaining: event.remaining,
        revealDuration: state.revealDuration || event.remaining,
      }
    case 'REVEAL_BUFFER_END':
      if (event.turnId !== state.currentTurnId) {
        return state
      }

      return {
        ...state,
        phase: 'timer-running',
        revealRemaining: 0,
      }
    case 'WORD_CHANGED':
      if (event.turnId !== state.currentTurnId) {
        return state
      }

      return {
        ...state,
        word: event.word,
        category: event.category,
        difficulty: event.difficulty,
        remainingWordChanges: event.remainingWordChanges,
      }
    case 'TIMER_TICK':
      if (event.turnId !== state.currentTurnId) {
        return state
      }

      return {
        ...state,
        phase: 'timer-running',
        timerRemaining: event.remaining,
      }
    case 'TURN_END':
      if (event.turnId !== state.currentTurnId) {
        return state
      }

      return clearLiveEventTurnFields(state, {
        phase: 'awaiting-verdict',
        turnEndReason: event.reason,
      })
    case 'BETWEEN_TURNS':
      return clearLiveEventTurnFields(state, {
        phase: 'between',
        nextPresenterName: event.nextPresenterName,
        nextPresenterAvatar: event.nextPresenterAvatar,
        turnEndReason: 'none',
      })
    case 'PRESENTER_DISCONNECTED':
      return state
    case 'GAME_END':
      return clearLiveEventTurnFields(state, {
        phase: 'ended',
        turnEndReason: 'none',
      })
    case 'GAME_RESET':
      return {
        ...INITIAL_PRESENTER_STATE,
        phase: 'host-left',
      }
  }
}

export function mapRoomStateToPresenterView(roomState: RoomState): PresenterViewState {
  switch (roomState.presenterPhase) {
    case 'host-left':
      return {
        ...INITIAL_PRESENTER_STATE,
        phase: 'host-left',
      }
    case 'round-order':
      return buildRoundOrderPresenterState()
    case 'your-turn':
    case 'reveal-buffer':
    case 'timer-running':
    case 'awaiting-verdict':
    case 'timeout':
      return mapActiveRoomState(roomState)
    case 'between':
      return {
        ...INITIAL_PRESENTER_STATE,
        phase: 'between',
        currentTurnId: roomState.currentTurnId,
        presenterName: roomState.currentPresenter,
        difficulty: roomState.currentDifficulty,
        canChangeWord: roomState.canChangeWord,
        remainingWordChanges: roomState.remainingWordChanges,
        timerRemaining: roomState.timerRemaining,
        timerDuration: roomState.timerDuration,
        nextPresenterName: roomState.nextPresenterName,
        nextPresenterAvatar: roomState.nextPresenterAvatar,
        nextStep: roomState.nextStep,
        turnEndReason: roomState.turnEndReason,
      }
    case 'ended':
      return {
        ...INITIAL_PRESENTER_STATE,
        phase: 'ended',
        currentTurnId: roomState.currentTurnId,
        presenterName: roomState.currentPresenter,
        difficulty: roomState.currentDifficulty,
        canChangeWord: roomState.canChangeWord,
        remainingWordChanges: roomState.remainingWordChanges,
        turnEndReason: roomState.turnEndReason,
      }
    case 'waiting':
    default:
      return INITIAL_PRESENTER_STATE
  }
}

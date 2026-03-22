// Kopia apps/hub/src/types/charades-events.ts
// Partykit CLI bundluje server.ts niezależnie od npm workspace — importy relative są bezpieczne,
// ale imports z innych workspace'ów mogą nie być rozwiązane. Typy trzymamy lokalnie.

export type HostEvent =
  | { type: 'TURN_START'; turnId: string; word: string; category: string; presenterName: string; timerSeconds: number }
  | { type: 'TIMER_TICK'; turnId: string; remaining: number }
  | { type: 'TURN_END'; turnId: string; reason: 'timeout' | 'verdict' }
  | { type: 'BETWEEN_TURNS'; nextPresenterName: string; nextPresenterAvatar: string }
  | { type: 'GAME_END' }
  | { type: 'GAME_RESET' }

export type PresenterEvent =
  | { type: 'PRESENTER_READY'; turnId: string }
  | { type: 'DEVICE_CONNECTED' }

export type CharadesEvent = HostEvent | PresenterEvent

export type RoomState = {
  phase: 'waiting' | 'turn' | 'between' | 'ended'
  currentTurnId: string
  currentWord: string
  currentCategory: string
  currentPresenter: string
  timerRemaining: number
  nextPresenterName: string
  nextPresenterAvatar: string
}

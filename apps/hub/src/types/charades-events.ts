// Eventy wysyłane przez HOSTA do prezentera
export type HostEvent =
  | { type: 'TURN_START'; turnId: string; word: string; category: string; presenterName: string; timerSeconds: number }
  | { type: 'REVEAL_BUFFER_START'; turnId: string; remaining: number }
  | { type: 'REVEAL_BUFFER_TICK'; turnId: string; remaining: number }
  | { type: 'REVEAL_BUFFER_END'; turnId: string }
  | { type: 'TIMER_TICK'; turnId: string; remaining: number }
  | { type: 'TURN_END'; turnId: string; reason: 'timeout' | 'verdict' | 'manual-stop' }
  | { type: 'BETWEEN_TURNS'; nextPresenterName: string; nextPresenterAvatar: string }
  | { type: 'GAME_END' }
  | { type: 'GAME_RESET' }

// Eventy wysyłane przez TELEFON PREZENTERA do hosta
export type PresenterEvent =
  | { type: 'WORD_REVEALED'; turnId: string }
  | { type: 'DEVICE_CONNECTED' }

export type CharadesEvent = HostEvent | PresenterEvent

// Stan rooma trzymany przez Partykit server
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

// Client-side copy of event types — PartyKit bundles independently so types are duplicated by design

export type CardColor = 'red' | 'blue' | 'neutral' | 'assassin'

export type Card = {
  word: string
  color: CardColor
  revealed: boolean
}

export type RoomPhase = 'waiting' | 'playing' | 'assassin-reveal' | 'ended'

export type RoomState = {
  phase: RoomPhase
  cards: Card[]
  redTotal: number
  blueTotal: number
  startingTeam: 'red' | 'blue' | null
  winner: 'red' | 'blue' | null
  assassinTeam: 'red' | 'blue' | null
  captainRedConnected: boolean
  captainBlueConnected: boolean
}

export type HostEvent =
  | { type: 'GAME_START'; cards: Card[]; redTotal: number; blueTotal: number; startingTeam: 'red' | 'blue' }
  | { type: 'CARD_REVEAL'; index: number }
  | { type: 'ASSASSIN_TEAM'; team: 'red' | 'blue' }
  | { type: 'GAME_RESET' }

export type CaptainEvent =
  | { type: 'CAPTAIN_CONNECTED'; team: 'red' | 'blue' }

export type ServerEvent =
  | { type: 'CAPTAIN_DISCONNECTED'; team: 'red' | 'blue' }

export type CodenamesEvent = HostEvent | CaptainEvent | ServerEvent

export type RoomStateMessage = {
  type: 'ROOM_STATE'
  state: RoomState
}

export type IncomingMessage = CodenamesEvent | RoomStateMessage

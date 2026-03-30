export type StoredPromptKey = string

export type StoredRejectedByPlayer = Record<string, StoredPromptKey[]>

export type StoredWordHistory = {
  sessionId: string
  usedPrompts: StoredPromptKey[]
  rejectedPromptsByPlayer: StoredRejectedByPlayer
  lastUpdatedAt: number
}

export function createEmptyWordHistory(sessionId: string): StoredWordHistory {
  return {
    sessionId,
    usedPrompts: [],
    rejectedPromptsByPlayer: {},
    lastUpdatedAt: Date.now(),
  }
}

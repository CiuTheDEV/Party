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

export function resetStoredWordHistory(history: StoredWordHistory): StoredWordHistory {
  return createEmptyWordHistory(history.sessionId)
}

export function resetStoredWordHistoryCategory(
  history: StoredWordHistory,
  categoryName: string,
): StoredWordHistory {
  const nextUsedPrompts = history.usedPrompts.filter((promptKey) => getCategoryFromPromptKey(promptKey) !== categoryName)

  const nextRejectedPromptsByPlayer = Object.fromEntries(
    Object.entries(history.rejectedPromptsByPlayer).map(([playerKey, promptKeys]) => [
      playerKey,
      promptKeys.filter((promptKey) => getCategoryFromPromptKey(promptKey) !== categoryName),
    ]),
  ) as StoredRejectedByPlayer

  return {
    sessionId: history.sessionId,
    usedPrompts: nextUsedPrompts,
    rejectedPromptsByPlayer: nextRejectedPromptsByPlayer,
    lastUpdatedAt: Date.now(),
  }
}

function getCategoryFromPromptKey(promptKey: StoredPromptKey) {
  const parts = promptKey.split('::')

  if (parts.length < 3) {
    return ''
  }

  return parts[parts.length - 2] ?? ''
}

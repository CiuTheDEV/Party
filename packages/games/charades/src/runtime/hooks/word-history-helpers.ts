import type { CharadesCategoryDifficulty, CharadesWordChangeScope } from '../../setup/state'
import type {
  StoredPromptKey,
  StoredRejectedByPlayer,
  StoredWordHistory,
} from '../shared/charades-word-history'
import { createEmptyWordHistory } from '../shared/charades-word-history'
import type { TurnPrompt } from './word-pool-helpers'

export const REJECTED_PROMPT_WEIGHT = 0.33

export function toPromptKey(prompt: TurnPrompt): StoredPromptKey {
  return `${prompt.word}::${prompt.category}::${prompt.difficulty}`
}

export function toPlayerHistoryKey(player: {
  name: string
  avatar: string
  gender?: 'on' | 'ona' | 'none'
}) {
  return `${player.name}::${player.avatar}::${player.gender ?? 'none'}`
}

export function normalizeWordHistory(history: StoredWordHistory | null | undefined, sessionId?: string): StoredWordHistory {
  const nextSessionId = history?.sessionId || sessionId || createSessionId()

  return {
    sessionId: nextSessionId,
    usedPrompts: history?.usedPrompts ?? [],
    rejectedPromptsByPlayer: history?.rejectedPromptsByPlayer ?? {},
    lastUpdatedAt: history?.lastUpdatedAt ?? Date.now(),
  }
}

export function createWordHistory(sessionId?: string) {
  return createEmptyWordHistory(sessionId ?? createSessionId())
}

export function appendRejectedPrompt(
  history: StoredWordHistory,
  playerKey: string,
  prompt: TurnPrompt,
): StoredWordHistory {
  const promptKey = toPromptKey(prompt)
  const current = history.rejectedPromptsByPlayer[playerKey] ?? []

  if (current.includes(promptKey)) {
    return touchWordHistory(history)
  }

  return {
    ...history,
    rejectedPromptsByPlayer: {
      ...history.rejectedPromptsByPlayer,
      [playerKey]: [...current, promptKey],
    },
    lastUpdatedAt: Date.now(),
  }
}

export function appendUsedPrompt(history: StoredWordHistory, prompt: TurnPrompt): StoredWordHistory {
  const promptKey = toPromptKey(prompt)

  if (history.usedPrompts.includes(promptKey)) {
    return touchWordHistory(history)
  }

  return {
    ...history,
    usedPrompts: [...history.usedPrompts, promptKey],
    lastUpdatedAt: Date.now(),
  }
}

export function getPromptWeight(params: {
  prompt: TurnPrompt
  usedPromptKeys?: Set<StoredPromptKey>
  rejectedPromptKeysThisTurn?: Set<StoredPromptKey>
  rejectedPromptKeysByPlayer?: Set<StoredPromptKey>
}) {
  const promptKey = toPromptKey(params.prompt)

  if (params.rejectedPromptKeysThisTurn?.has(promptKey)) {
    return 0
  }

  if (params.rejectedPromptKeysByPlayer?.has(promptKey)) {
    return REJECTED_PROMPT_WEIGHT
  }

  return 1
}

export function pickWeightedPrompt(
  prompts: TurnPrompt[],
  getWeight: (prompt: TurnPrompt) => number,
  rng: () => number = Math.random,
): TurnPrompt | null {
  const weighted = prompts
    .map((prompt) => ({ prompt, weight: getWeight(prompt) }))
    .filter((entry) => entry.weight > 0)

  if (weighted.length === 0) {
    return null
  }

  const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0)
  let threshold = rng() * totalWeight

  for (const entry of weighted) {
    threshold -= entry.weight
    if (threshold <= 0) {
      return entry.prompt
    }
  }

  return weighted[weighted.length - 1]?.prompt ?? null
}

export function getRejectedPromptKeysForPlayer(
  rejectedPromptsByPlayer: StoredRejectedByPlayer,
  playerKey: string,
) {
  return new Set(rejectedPromptsByPlayer[playerKey] ?? [])
}

export function getUsedPromptKeys(history: StoredWordHistory) {
  return new Set(history.usedPrompts)
}

export function getCandidatePool(params: {
  prompts: TurnPrompt[]
  scope: CharadesWordChangeScope | 'initial'
  currentPrompt?: TurnPrompt | null
  usedPromptKeys: Set<StoredPromptKey>
  rejectedPromptKeysThisTurn: Set<StoredPromptKey>
  rejectedPromptKeysByPlayer: Set<StoredPromptKey>
}) {
  const scopedPrompts = params.prompts.filter((prompt) => {
    if (params.scope === 'initial' || !params.currentPrompt) {
      return true
    }

    if (params.scope === 'word-only') {
      return (
        prompt.category === params.currentPrompt.category &&
        prompt.difficulty === params.currentPrompt.difficulty &&
        prompt.word !== params.currentPrompt.word
      )
    }

    return toPromptKey(prompt) !== toPromptKey(params.currentPrompt)
  })

  const unseenPrompts = scopedPrompts.filter((prompt) => !params.usedPromptKeys.has(toPromptKey(prompt)))
  const candidateSource = unseenPrompts.length > 0 ? unseenPrompts : scopedPrompts

  return pickWeightedPrompt(candidateSource, (prompt) =>
    getPromptWeight({
      prompt,
      usedPromptKeys: params.usedPromptKeys,
      rejectedPromptKeysThisTurn: params.rejectedPromptKeysThisTurn,
      rejectedPromptKeysByPlayer: params.rejectedPromptKeysByPlayer,
    }),
  )
}

export function getRemainingPromptCount(prompts: TurnPrompt[], usedPromptKeys: Set<StoredPromptKey>) {
  return prompts.filter((prompt) => !usedPromptKeys.has(toPromptKey(prompt))).length
}

function touchWordHistory(history: StoredWordHistory): StoredWordHistory {
  return {
    ...history,
    lastUpdatedAt: Date.now(),
  }
}

function createSessionId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return Math.random().toString(36).slice(2)
}

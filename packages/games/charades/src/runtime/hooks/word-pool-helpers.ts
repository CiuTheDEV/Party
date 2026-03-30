import type { CharadesWordCategory } from '../../setup/helpers'
import type { CharadesCategoryDifficulty, CharadesSelectedCategories } from '../../setup/state'
import { getCandidatePool, getRejectedPromptKeysForPlayer, getUsedPromptKeys, toPromptKey } from './word-history-helpers'
import type { StoredWordHistory } from '../shared/charades-word-history'

export type TurnPrompt = {
  word: string
  category: string
  difficulty: CharadesCategoryDifficulty
}

function shuffle<T>(arr: T[]): T[] {
  const values = [...arr]

  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[values[index], values[swapIndex]] = [values[swapIndex], values[index]]
  }

  return values
}

export function buildPromptPool(
  categories: CharadesWordCategory[],
  selected: CharadesSelectedCategories,
): TurnPrompt[] {
  const prompts = categories.flatMap((category) => {
    const difficulties: CharadesCategoryDifficulty[] = selected[category.id] ?? ['easy']
    const nextPrompts: TurnPrompt[] = []

    if (difficulties.includes('easy')) {
      nextPrompts.push(
        ...category.wordsEasy.map((word) => ({
          word,
          category: category.name,
          difficulty: 'easy' as const,
        })),
      )
    }

    if (difficulties.includes('hard')) {
      nextPrompts.push(
        ...category.wordsHard.map((word) => ({
          word,
          category: category.name,
          difficulty: 'hard' as const,
        })),
      )
    }

    return nextPrompts
  })

  return shuffle(prompts)
}

export function createPromptPoolState(
  categories: CharadesWordCategory[],
  selected: CharadesSelectedCategories,
): TurnPrompt[] {
  return buildPromptPool(categories, selected)
}

export function selectPromptCandidate(params: {
  prompts: TurnPrompt[]
  playerKey: string
  history: StoredWordHistory
}) {
  return getCandidatePool({
    prompts: params.prompts,
    scope: 'initial',
    usedPromptKeys: getUsedPromptKeys(params.history),
    rejectedPromptKeysThisTurn: new Set(),
    rejectedPromptKeysByPlayer: getRejectedPromptKeysForPlayer(params.history.rejectedPromptsByPlayer, params.playerKey),
  })
}

export function selectPromptRerollCandidate(params: {
  prompts: TurnPrompt[]
  playerKey: string
  history: StoredWordHistory
  currentPrompt: TurnPrompt
  rejectedPromptKeysThisTurn: string[]
  scope: 'word-only' | 'word-and-category'
}) {
  return getCandidatePool({
    prompts: params.prompts,
    scope: params.scope,
    currentPrompt: params.currentPrompt,
    usedPromptKeys: getUsedPromptKeys(params.history),
    rejectedPromptKeysThisTurn: new Set([
      ...params.rejectedPromptKeysThisTurn,
      toPromptKey(params.currentPrompt),
    ]),
    rejectedPromptKeysByPlayer: getRejectedPromptKeysForPlayer(params.history.rejectedPromptsByPlayer, params.playerKey),
  })
}

export function buildCategoryPromptPool(
  category: CharadesWordCategory,
  difficulties: CharadesCategoryDifficulty[],
) {
  const selected: CharadesSelectedCategories = { [category.id]: difficulties }
  return buildPromptPool([category], selected)
}

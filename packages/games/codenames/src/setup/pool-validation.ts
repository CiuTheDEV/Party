import type { GameWordCategory } from '@party/game-sdk'
import {
  buildCodenamesPoolKey,
  getFreshWordsForCategories,
  getFreshWordsForPool,
  type StoredCodenamesWordHistory,
} from '../runtime/shared/codenames-word-history'

export type CodenamesPoolSummary = {
  poolKey: string
  total: number
  remaining: number
  isExhausted: boolean
}

export type CodenamesCategoryPoolSummary = {
  categoryId: string
  name: string
  total: number
  remaining: number
  isExhausted: boolean
  isSelected: boolean
}

export const CODENAMES_BOARD_WORD_COUNT = 25

export function getCodenamesPoolSummary(params: {
  categories: GameWordCategory[]
  selectedCategories: Record<string, true>
  history: StoredCodenamesWordHistory | null | undefined
}) {
  const poolKey = buildCodenamesPoolKey(params.selectedCategories)
  const activeCategories = params.categories.filter((category) => params.selectedCategories[category.id])
  const wordPool = activeCategories.flatMap((category) => category.words)
  const freshWords = poolKey
    ? getFreshWordsForCategories({
        categories: activeCategories.map((category) => ({ id: category.id, words: category.words })),
        history: params.history,
      })
    : wordPool

  return {
    poolKey,
    total: wordPool.length,
    remaining: freshWords.length,
    isExhausted: wordPool.length > 0 && freshWords.length < CODENAMES_BOARD_WORD_COUNT,
  } satisfies CodenamesPoolSummary
}

export function getCodenamesCategoryPoolSummaries(params: {
  categories: GameWordCategory[]
  selectedCategories: Record<string, true>
  history: StoredCodenamesWordHistory | null | undefined
}) {
  return params.categories.map((category) => {
    const freshWords = getFreshWordsForPool({
      wordPool: category.words,
      history: params.history,
      poolKey: category.id,
    })

    return {
      categoryId: category.id,
      name: category.name,
      total: category.words.length,
      remaining: freshWords.length,
      isExhausted: category.words.length > 0 && freshWords.length < CODENAMES_BOARD_WORD_COUNT,
      isSelected: Boolean(params.selectedCategories[category.id]),
    } satisfies CodenamesCategoryPoolSummary
  })
}

export function appendPoolValidationError(params: {
  errors: string[]
  summary: CodenamesPoolSummary
  minWordsRequired?: number
}) {
  const nextErrors = [...params.errors]

  if (params.summary.poolKey && params.summary.remaining < (params.minWordsRequired ?? CODENAMES_BOARD_WORD_COUNT)) {
    nextErrors.push('Aktywna pula ma mniej niż 25 świeżych haseł. Zresetuj pulę przed startem gry.')
  }

  return nextErrors
}

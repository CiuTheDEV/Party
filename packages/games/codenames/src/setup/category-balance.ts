import { CODENAMES_BOARD_WORD_COUNT } from './pool-validation'
import { CODENAMES_CATEGORY_IDS } from './state'
import type { CodenamesCategoryBalance } from './state'

export function hasExactlyTwoSelectedCategories(selectedCategories: Record<string, true>) {
  return getBalancedCategoryIds(selectedCategories) !== null
}

export function getBalancedCategoryIds(selectedCategories: Record<string, true>) {
  const knownCategoryIds = new Set<string>(CODENAMES_CATEGORY_IDS)
  const balancedCategoryIds = Object.keys(selectedCategories).filter((categoryId) =>
    knownCategoryIds.has(categoryId),
  )

  if (balancedCategoryIds.length !== 2) {
    return null
  }

  return balancedCategoryIds.sort() as [string, string]
}

function normalizeLeftSharePercent(leftSharePercent: number) {
  if (!Number.isFinite(leftSharePercent)) {
    return 50
  }

  return Math.max(0, Math.min(100, Math.round(leftSharePercent)))
}

export function resolveBoardSplit(balance: CodenamesCategoryBalance) {
  const safeLeftSharePercent = normalizeLeftSharePercent(balance.leftSharePercent)
  const leftCount = Math.round((CODENAMES_BOARD_WORD_COUNT * safeLeftSharePercent) / 100)

  return {
    leftCount,
    rightCount: CODENAMES_BOARD_WORD_COUNT - leftCount,
  }
}

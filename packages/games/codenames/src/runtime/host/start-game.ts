import { CODENAMES_BOARD_WORD_COUNT } from '../../setup/pool-validation'
import { resolveBoardSplit } from '../../setup/category-balance'
import type { CodenamesCategoryBalance } from '../../setup/state'
import { generateBoard } from '../shared/board-generator'
import {
  getFreshWordsForCategories,
  getFreshWordsForPool,
  recordUsedWordsForCategories,
  type StoredCodenamesWordHistory,
} from '../shared/codenames-word-history'

export function prepareCodenamesGameStart(params: {
  categories: Array<{ id: string; words: string[] }>
  history: StoredCodenamesWordHistory
  categoryBalance?: CodenamesCategoryBalance | null
}) {
  if (params.categoryBalance) {
    if (params.categories.length !== 2) {
      return {
        ok: false as const,
        reason: 'Wybrany balans planszy nie pasuje do aktywnych kategorii.',
      }
    }

    const leftCategory = params.categories.find(
      (category) => category.id === params.categoryBalance?.leftCategoryId,
    )
    const rightCategory = params.categories.find(
      (category) => category.id === params.categoryBalance?.rightCategoryId,
    )

    if (
      !leftCategory ||
      !rightCategory ||
      leftCategory.id === rightCategory.id ||
      new Set([leftCategory.id, rightCategory.id]).size !== 2
    ) {
      return {
        ok: false as const,
        reason: 'Wybrany balans planszy nie pasuje do aktywnych kategorii.',
      }
    }

    const leftFreshWords = getFreshWordsForPool({
      wordPool: leftCategory.words,
      history: params.history,
      poolKey: leftCategory.id,
    })
    const rightFreshWords = getFreshWordsForPool({
      wordPool: rightCategory.words,
      history: params.history,
      poolKey: rightCategory.id,
    })
    const { leftCount, rightCount } = resolveBoardSplit(params.categoryBalance)

    if (leftFreshWords.length < leftCount || rightFreshWords.length < rightCount) {
      return {
        ok: false as const,
        reason: 'Wybrany balans planszy wymaga większej liczby świeżych haseł w jednej z kategorii.',
      }
    }

    const freshWords = [
      ...leftFreshWords.slice(0, leftCount),
      ...rightFreshWords.slice(0, rightCount),
    ]
    const board = generateBoard(freshWords)
    const history = recordUsedWordsForCategories({
      categories: params.categories,
      history: params.history,
      usedWords: board.cards.map((card) => card.word),
    })

    return {
      ok: true as const,
      board,
      history,
    }
  }

  const freshWords = getFreshWordsForCategories({
    categories: params.categories,
    history: params.history,
  })

  if (freshWords.length < CODENAMES_BOARD_WORD_COUNT) {
    return {
      ok: false as const,
      reason: 'Aktywna pula ma mniej niż 25 świeżych haseł. Zresetuj pulę przed kolejną planszą.',
    }
  }

  const board = generateBoard(freshWords)
  const history = recordUsedWordsForCategories({
    categories: params.categories,
    history: params.history,
    usedWords: board.cards.map((card) => card.word),
  })

  return {
    ok: true as const,
    board,
    history,
  }
}

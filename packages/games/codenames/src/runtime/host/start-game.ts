import { CODENAMES_BOARD_WORD_COUNT } from '../../setup/pool-validation'
import { generateBoard } from '../shared/board-generator'
import {
  getFreshWordsForCategories,
  recordUsedWordsForCategories,
  type StoredCodenamesWordHistory,
} from '../shared/codenames-word-history'

export function prepareCodenamesGameStart(params: {
  categories: Array<{ id: string; words: string[] }>
  history: StoredCodenamesWordHistory
}) {
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

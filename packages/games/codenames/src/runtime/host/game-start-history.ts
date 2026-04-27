import type { Card } from '../shared/codenames-events'
import {
  recordUsedWordsForCategories,
  type StoredCodenamesWordHistory,
} from '../shared/codenames-word-history'

export type PendingGameStartHistory = {
  signature: string
  usedWords: string[]
}

export function createPendingGameStartHistory(params: { cards: Card[] }): PendingGameStartHistory {
  return {
    signature: getBoardSignature(params.cards),
    usedWords: params.cards.map((card) => card.word),
  }
}

export function commitPendingGameStartHistory(params: {
  pending: PendingGameStartHistory | null
  categories: Array<{ id: string; words: string[] }>
  cards: Card[]
  history: StoredCodenamesWordHistory
}) {
  if (!params.pending) {
    return params.history
  }

  if (params.pending.signature !== getBoardSignature(params.cards)) {
    return params.history
  }

  return recordUsedWordsForCategories({
    categories: params.categories,
    history: params.history,
    usedWords: params.pending.usedWords,
  })
}

function getBoardSignature(cards: Card[]) {
  return JSON.stringify(cards.map((card) => [card.word, card.color]))
}

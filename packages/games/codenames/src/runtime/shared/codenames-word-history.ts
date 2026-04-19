export type StoredCodenamesWordHistory = {
  pools: Record<string, StoredCodenamesWordHistoryPool>
}

type StoredCodenamesWordHistoryPool = {
  usedWords: string[]
  lastUpdatedAt: number
}

export const CODENAMES_WORD_HISTORY_STORAGE_KEY = 'codenames:word-history'

export function createEmptyCodenamesWordHistory(): StoredCodenamesWordHistory {
  return { pools: {} }
}

export function buildCodenamesPoolKey(selectedCategories: Record<string, true>) {
  return Object.keys(selectedCategories)
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right))
    .join('|')
}

export function normalizeCodenamesWordHistory(raw: unknown): StoredCodenamesWordHistory {
  if (!isRecord(raw) || !isRecord(raw.pools)) {
    return createEmptyCodenamesWordHistory()
  }

  const pools = Object.fromEntries(
    Object.entries(raw.pools).map(([poolKey, value]) => [poolKey, normalizePool(value)]),
  )

  return { pools }
}

export function getFreshWordsForPool(params: {
  wordPool: string[]
  history: StoredCodenamesWordHistory | null | undefined
  poolKey: string
}) {
  const history = normalizeCodenamesWordHistory(params.history)
  const usedWords = new Set(history.pools[params.poolKey]?.usedWords ?? [])

  return params.wordPool.filter((word) => !usedWords.has(word))
}

export function getFreshWordsForCategories(params: {
  categories: Array<{ id: string; words: string[] }>
  history: StoredCodenamesWordHistory | null | undefined
}) {
  return params.categories.flatMap((category) =>
    getFreshWordsForPool({
      wordPool: category.words,
      history: params.history,
      poolKey: category.id,
    }),
  )
}

export function recordUsedWordsForPool(params: {
  history: StoredCodenamesWordHistory | null | undefined
  poolKey: string
  usedWords: string[]
  now?: () => number
}) {
  const history = normalizeCodenamesWordHistory(params.history)
  const currentPool = history.pools[params.poolKey] ?? createEmptyPool((params.now ?? Date.now)())
  const nextUsedWords = Array.from(new Set([...currentPool.usedWords, ...normalizeWords(params.usedWords)]))

  return {
    pools: {
      ...history.pools,
      [params.poolKey]: {
        usedWords: nextUsedWords,
        lastUpdatedAt: (params.now ?? Date.now)(),
      },
    },
  }
}

export function recordUsedWordsForCategories(params: {
  categories: Array<{ id: string; words: string[] }>
  history: StoredCodenamesWordHistory | null | undefined
  usedWords: string[]
  now?: () => number
}) {
  return params.categories.reduce((history, category) => {
    const categoryWords = new Set(normalizeWords(category.words))
    const matchingWords = normalizeWords(params.usedWords).filter((word) => categoryWords.has(word))

    if (matchingWords.length === 0) {
      return history
    }

    return recordUsedWordsForPool({
      history,
      poolKey: category.id,
      usedWords: matchingWords,
      now: params.now,
    })
  }, normalizeCodenamesWordHistory(params.history))
}

export function resetCodenamesPoolHistory(params: {
  history: StoredCodenamesWordHistory | null | undefined
  poolKey: string
  now?: () => number
}) {
  const history = normalizeCodenamesWordHistory(params.history)

  return {
    pools: {
      ...history.pools,
      [params.poolKey]: createEmptyPool((params.now ?? Date.now)()),
    },
  }
}

export function resetCodenamesCategoryHistories(params: {
  categoryIds: string[]
  history: StoredCodenamesWordHistory | null | undefined
  now?: () => number
}) {
  return normalizeWords(params.categoryIds).reduce(
    (history, categoryId) =>
      resetCodenamesPoolHistory({
        history,
        poolKey: categoryId,
        now: params.now,
      }),
    normalizeCodenamesWordHistory(params.history),
  )
}

export function readCodenamesWordHistory() {
  if (typeof window === 'undefined') {
    return createEmptyCodenamesWordHistory()
  }

  const raw = window.localStorage.getItem(CODENAMES_WORD_HISTORY_STORAGE_KEY)

  if (!raw) {
    return createEmptyCodenamesWordHistory()
  }

  try {
    return normalizeCodenamesWordHistory(JSON.parse(raw))
  } catch {
    return createEmptyCodenamesWordHistory()
  }
}

export function writeCodenamesWordHistory(history: StoredCodenamesWordHistory) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(CODENAMES_WORD_HISTORY_STORAGE_KEY, JSON.stringify(history))
}

function normalizePool(value: unknown): StoredCodenamesWordHistoryPool {
  const lastUpdatedAt = isRecord(value) && typeof value.lastUpdatedAt === 'number' ? value.lastUpdatedAt : Date.now()

  return {
    usedWords: isRecord(value) ? normalizeWords(value.usedWords) : [],
    lastUpdatedAt,
  }
}

function normalizeWords(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return Array.from(
    new Set(
      value
        .filter((entry): entry is string => typeof entry === 'string')
        .map((word) => word.trim())
        .filter(Boolean),
    ),
  )
}

function createEmptyPool(lastUpdatedAt: number): StoredCodenamesWordHistoryPool {
  return {
    usedWords: [],
    lastUpdatedAt,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

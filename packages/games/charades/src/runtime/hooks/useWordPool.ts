import { useState, useCallback } from 'react'
import type { CharadesWordCategory } from '../../setup/helpers'
import type { CharadesCategoryDifficulty, CharadesSelectedCategories } from '../../setup/state'

export type WordPoolEntry = {
  word: string
  difficulty: CharadesCategoryDifficulty
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildPool(categories: CharadesWordCategory[], selected: CharadesSelectedCategories): WordPoolEntry[] {
  const words = categories.flatMap((c) => {
    const diffs: CharadesCategoryDifficulty[] = selected[c.id] ?? ['easy']
    const out: WordPoolEntry[] = []
    if (diffs.includes('easy')) out.push(...c.wordsEasy.map((word) => ({ word, difficulty: 'easy' as const })))
    if (diffs.includes('hard')) out.push(...c.wordsHard.map((word) => ({ word, difficulty: 'hard' as const })))
    return out
  })
  return shuffle(words)
}

export function useWordPool(categories: CharadesWordCategory[], selected: CharadesSelectedCategories) {
  const [pool, setPool] = useState<WordPoolEntry[]>(() => buildPool(categories, selected))
  const [index, setIndex] = useState(0)

  const nextWord = useCallback((): WordPoolEntry => {
    if (index >= pool.length) {
      const newPool = buildPool(categories, selected)
      setPool(newPool)
      setIndex(1)
      return newPool[0]
    }
    const word = pool[index]
    setIndex((i) => i + 1)
    return word
  }, [pool, index, categories, selected])

  const reset = useCallback(() => {
    setPool(buildPool(categories, selected))
    setIndex(0)
  }, [categories, selected])

  return { nextWord, reset }
}

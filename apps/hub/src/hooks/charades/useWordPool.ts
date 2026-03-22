import { useState, useCallback } from 'react'
import type { WordCategory } from '../../../../content/charades/index'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildPool(categories: WordCategory[]): string[] {
  const words = categories.flatMap((c) => c.words)
  return shuffle(words)
}

export function useWordPool(categories: WordCategory[]) {
  const [pool, setPool] = useState<string[]>(() => buildPool(categories))
  const [index, setIndex] = useState(0)

  const nextWord = useCallback((): string => {
    if (index >= pool.length) {
      // Wyczerpano pulę — nowa przetasowana pula
      const newPool = buildPool(categories)
      setPool(newPool)
      setIndex(1)
      return newPool[0]
    }
    const word = pool[index]
    setIndex((i) => i + 1)
    return word
  }, [pool, index, categories])

  const reset = useCallback(() => {
    setPool(buildPool(categories))
    setIndex(0)
  }, [categories])

  return { nextWord, reset }
}

import { useState, useCallback } from 'react'
import type { WordCategory } from '@content/charades/index'
import type { CategoryDifficulty, SelectedCategories } from '../../components/charades/CategoryPicker/CategoryPicker'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildPool(categories: WordCategory[], selected: SelectedCategories): string[] {
  const words = categories.flatMap((c) => {
    const diffs: CategoryDifficulty[] = selected[c.id] ?? ['easy']
    const out: string[] = []
    if (diffs.includes('easy')) out.push(...c.wordsEasy)
    if (diffs.includes('hard')) out.push(...c.wordsHard)
    return out
  })
  return shuffle(words)
}

export function useWordPool(categories: WordCategory[], selected: SelectedCategories) {
  const [pool, setPool] = useState<string[]>(() => buildPool(categories, selected))
  const [index, setIndex] = useState(0)

  const nextWord = useCallback((): string => {
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

export type WordCategory = {
  id: string
  name: string        // po polsku, wyświetlana w UI
  words: string[]
}

export { animals } from './animals'
export { movies } from './movies'
export { sport } from './sport'

import { animals } from './animals'
import { movies } from './movies'
import { sport } from './sport'

export const allCategories: WordCategory[] = [animals, movies, sport]

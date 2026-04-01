export type WordCategory = {
  id: string
  name: string        // po polsku, wyświetlana w UI
  wordsEasy: string[]
  wordsHard: string[]
}

export { animals } from './animals'
export { movies } from './movies'
export { sport } from './sport'
export { food } from './food'
export { professions } from './professions'
export { places } from './places'
export { famous } from './famous'
export { activities } from './activities'
export { developer } from './developer'

import { animals } from './animals'
import { movies } from './movies'
import { sport } from './sport'
import { food } from './food'
import { professions } from './professions'
import { places } from './places'
import { famous } from './famous'
import { activities } from './activities'
import { developer } from './developer'

export const allCategories: WordCategory[] = [
  animals,
  movies,
  sport,
  food,
  professions,
  places,
  famous,
  activities,
  developer,
]

export type WordCategory = {
  id: string
  name: string        // display name shown in UI
  wordsEasy: string[]
  wordsHard: string[]
}

export { classic } from './classic'
export { animals } from './animals'
export { movies } from './movies'
export { music } from './music'
export { sport } from './sport'
export { food } from './food'
export { professions } from './professions'
export { places } from './places'
export { random } from './random'
export { famous } from './famous'
export { activities } from './activities'
export { developer } from './developer'

import { classic } from './classic'
import { animals } from './animals'
import { movies } from './movies'
import { music } from './music'
import { sport } from './sport'
import { food } from './food'
import { professions } from './professions'
import { places } from './places'
import { random } from './random'
import { famous } from './famous'
import { activities } from './activities'
import { developer } from './developer'

export const allCategories: WordCategory[] = [
  classic,
  movies,
  music,
  sport,
  professions,
  food,
  places,
  animals,
  random,
  developer,
]

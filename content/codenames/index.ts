import { standardWords } from './standard'
import { plus18Words } from './plus18'

export type CodenamesWordCategory = {
  id: string
  name: string
  words: string[]
}

export const codenamesCategories: CodenamesWordCategory[] = [
  { id: 'standard', name: 'Standardowe', words: standardWords },
  { id: 'plus18', name: '+18', words: plus18Words },
]

export { standardWords, plus18Words }

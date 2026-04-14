import { standardWords } from './standard'
import { plus18Words } from './plus18'

export type CodenamesWordCategory = {
  id: string
  name: string
  description: string
  words: string[]
}

export const codenamesCategories: CodenamesWordCategory[] = [
  {
    id: 'standard',
    name: 'Standardowe',
    description: 'Ogólne hasła odpowiednie dla każdego. Bez treści dla dorosłych.',
    words: standardWords,
  },
  {
    id: 'plus18',
    name: '+18',
    description: 'Hasła z humorem dla dorosłych. Tylko dla pełnoletniej grupy.',
    words: plus18Words,
  },
]

export { standardWords, plus18Words }

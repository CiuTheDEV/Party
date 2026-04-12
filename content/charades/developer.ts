import type { WordCategory } from './index'

export const developer: WordCategory = {
  id: 'developer',
  name: 'DEV',
  wordsEasy: [
    'Pull request.',
    'Code review.',
    'Dark mode.',
    'Hotfix na produkcji.',
    'Merge conflict.',
  ],
  wordsHard: [
    'Aplikacja działa lokalnie, ale nie przechodzi na produkcji.',
    'Junior odpalił deploy w piątek pięć minut przed końcem pracy.',
    'Backend czeka na frontend, a frontend czeka na backend.',
    'Wszyscy potwierdzają, że przeczytali dokumentację, ale nikt jej nie czytał.',
    'Staging wygląda dobrze, dopóki klient nie kliknie dokładnie tego jednego przycisku.',
  ],
}

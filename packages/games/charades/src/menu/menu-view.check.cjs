const path = require('node:path')

const targetPath = path.resolve(process.cwd(), process.argv[2])
const { getCharadesMenuActiveHref, resolveCharadesMenuViewFromHref } = require(targetPath)

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`)
  }
}

assertEqual(resolveCharadesMenuViewFromHref('/games/charades'), 'mode', 'menu href should map to mode view')
assertEqual(resolveCharadesMenuViewFromHref('/games/charades/settings'), 'settings', 'settings href should map to settings view')
assertEqual(resolveCharadesMenuViewFromHref('/games/charades/rankings'), null, 'unknown href should not remap view')
assertEqual(getCharadesMenuActiveHref('mode'), '/games/charades', 'mode view should expose menu href')
assertEqual(
  getCharadesMenuActiveHref('settings'),
  '/games/charades/settings',
  'settings view should expose settings href',
)

console.log('menu-view check passed')

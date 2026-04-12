const assert = require('node:assert/strict')
const path = require('node:path')

const modulePath = process.env.CHARADES_CATEGORY_ACCESS_MODULE_PATH || process.argv[2]

if (!modulePath) {
  throw new Error('Expected compiled category access module path as first argument.')
}

const access = require(path.resolve(process.cwd(), modulePath))

function run(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    console.error(`not ok - ${name}`)
    throw error
  }
}

const categories = [
  { id: 'classic', name: 'Klasyczne' },
  { id: 'movies', name: 'Filmy' },
  { id: 'animals', name: 'Zwierzęta' },
]

run('classic stays unlocked without an activation code', () => {
  assert.equal(access.isCharadesCategoryUnlocked('classic', []), true)
  assert.equal(access.isCharadesCategoryUnlocked('movies', []), false)
})

run('activation code unlocks every premium category', () => {
  assert.equal(access.isCharadesCategoryUnlocked('movies', ['charades_category_pack']), true)
  assert.equal(access.isCharadesCategoryUnlocked('animals', ['charades_category_pack']), true)
})

run('selected locked categories are stripped from persisted setup', () => {
  const selected = {
    classic: ['easy'],
    movies: ['hard'],
    animals: ['easy', 'hard'],
  }

  assert.deepEqual(access.sanitizeCharadesSelectedCategories(selected, categories, []), {
    classic: ['easy'],
  })
})

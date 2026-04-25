const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled library card media module path as first argument.')
}

const mediaModule = require(path.resolve(process.cwd(), builtModulePath))

function run(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    console.error(`not ok - ${name}`)
    throw error
  }
}

run('returns video media when a card has a loop path', () => {
  const media = mediaModule.resolveLibraryCardMedia({
    imagePath: '/images/game-cards/codenames-card-main.png',
    videoPath: '/videos/game-cards/codenames-card-main.mp4',
  })

  assert.deepEqual(media, {
    kind: 'video',
    src: '/videos/game-cards/codenames-card-main.mp4',
    poster: '/images/game-cards/codenames-card-main.png',
  })
})

run('returns video media for the charades loop with image poster fallback', () => {
  const media = mediaModule.resolveLibraryCardMedia({
    imagePath: '/images/game-cards/charades-card-main.png',
    videoPath: '/videos/game-cards/charades-card-main.mp4',
  })

  assert.deepEqual(media, {
    kind: 'video',
    src: '/videos/game-cards/charades-card-main.mp4',
    poster: '/images/game-cards/charades-card-main.png',
  })
})

run('returns video media for the five seconds loop with image poster fallback', () => {
  const media = mediaModule.resolveLibraryCardMedia({
    imagePath: '/images/game-cards/five-seconds-card-main.png',
    videoPath: '/videos/game-cards/five-seconds-card-main.mp4',
  })

  assert.deepEqual(media, {
    kind: 'video',
    src: '/videos/game-cards/five-seconds-card-main.mp4',
    poster: '/images/game-cards/five-seconds-card-main.png',
  })
})

run('returns video media for the spyfall loop with image poster fallback', () => {
  const media = mediaModule.resolveLibraryCardMedia({
    imagePath: '/images/game-cards/spyfall-card-main.png',
    videoPath: '/videos/game-cards/spyfall-card-main.mp4',
  })

  assert.deepEqual(media, {
    kind: 'video',
    src: '/videos/game-cards/spyfall-card-main.mp4',
    poster: '/images/game-cards/spyfall-card-main.png',
  })
})

run('returns image media when a card has only a static image', () => {
  const media = mediaModule.resolveLibraryCardMedia({
    imagePath: '/images/game-cards/charades-card-main.png',
  })

  assert.deepEqual(media, {
    kind: 'image',
    src: '/images/game-cards/charades-card-main.png',
  })
})

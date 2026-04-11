const assert = require('node:assert/strict')

const modulePath = process.argv[2]

if (!modulePath) {
  throw new Error('Expected compiled round-order animation module path as first argument.')
}

const { getRoundOrderAnimationProfile } = require(modulePath)

function run(name, fn) {
  try {
    fn()
    console.log(`PASS ${name}`)
  } catch (error) {
    console.error(`FAIL ${name}`)
    throw error
  }
}

run('uses a snappier collect phase than deal phase', () => {
  const profile = getRoundOrderAnimationProfile()

  assert.ok(profile.collect.duration < profile.deal.glideDuration)
  assert.ok(profile.collect.pauseAfterMs < profile.deal.pauseAfterMs)
})

run('keeps the deal animation in two readable motion phases plus flip', () => {
  const profile = getRoundOrderAnimationProfile()

  assert.equal(profile.deal.glideYOffset, -12)
  assert.ok(profile.deal.glideDuration > profile.deal.settleDuration)
  assert.ok(profile.deal.faceSwapDelay > profile.deal.flipStartDelay)
  assert.ok(profile.deal.faceSwapDelay < profile.deal.flipStartDelay + profile.deal.flipDuration)
})

run('lands with only a brief hold before the next card', () => {
  const profile = getRoundOrderAnimationProfile()

  assert.ok(profile.deal.landedHoldDuration <= 0.1)
  assert.ok(profile.deal.fadeDuration < 0.04)
})

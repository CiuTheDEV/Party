const assert = require('node:assert/strict')

const modulePath = process.argv[2]

if (!modulePath) {
  throw new Error('Expected compiled charades motion module path as first argument.')
}

const {
  charadesMotionProfile,
  getTimerMotionTier,
  resolveReducedMotionPreference,
} = require(modulePath)

function run(name, fn) {
  try {
    fn()
    console.log(`PASS ${name}`)
  } catch (error) {
    console.error(`FAIL ${name}`)
    throw error
  }
}

run('defines a compact game-show motion profile', () => {
  assert.ok(charadesMotionProfile.enter.duration <= 0.5)
  assert.ok(charadesMotionProfile.phaseTransition.duration <= 0.32)
  assert.ok(charadesMotionProfile.verdict.stagger <= 0.06)
})

run('escalates timer pressure from normal to warning to critical', () => {
  assert.equal(getTimerMotionTier(18, 60), 'normal')
  assert.equal(getTimerMotionTier(6, 60), 'warning')
  assert.equal(getTimerMotionTier(3, 60), 'critical')
})

run('treats reduced motion as an explicit opt-out', () => {
  assert.equal(resolveReducedMotionPreference({ matches: true }), true)
  assert.equal(resolveReducedMotionPreference({ matches: false }), false)
  assert.equal(resolveReducedMotionPreference(undefined), false)
})

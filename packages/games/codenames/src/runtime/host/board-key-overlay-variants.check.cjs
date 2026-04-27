const assert = require('node:assert/strict')
const path = require('node:path')

const modulePath = process.argv[2]

if (!modulePath) {
  throw new Error('Expected compiled module path as the first argument.')
}

const {
  BOARD_KEY_OVERLAY_AUTO_REVEAL_ON_END,
  BOARD_KEY_OVERLAY_DEFAULT_VARIANT,
  BOARD_KEY_OVERLAY_VARIANTS,
  isBoardKeyOverlayVariant,
} = require(path.resolve(modulePath))

assert.equal(BOARD_KEY_OVERLAY_DEFAULT_VARIANT, 1)
assert.deepEqual(
  BOARD_KEY_OVERLAY_VARIANTS.map((variant) => variant.id),
  [1],
)
assert.deepEqual(
  BOARD_KEY_OVERLAY_VARIANTS.map((variant) => variant.skill),
  ['frontend-design'],
)
assert.equal(BOARD_KEY_OVERLAY_AUTO_REVEAL_ON_END, false)
assert.equal(isBoardKeyOverlayVariant(1), true)
assert.equal(isBoardKeyOverlayVariant(2), false)
assert.equal(isBoardKeyOverlayVariant(3), false)
assert.equal(isBoardKeyOverlayVariant(4), false)

console.log('ok - board key overlay policy pins variant 1 and disables auto reveal on end')

const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled runtime navigation profile module path as first argument.')
}

const compiledProfilePath = path.resolve(process.cwd(), builtModulePath)
const compiledTargetsPath = path.resolve(path.dirname(compiledProfilePath), 'codenames-navigation-targets.js')

const { codenamesRuntimeNavigationProfile } = require(compiledProfilePath)
const {
  CODENAMES_NAVIGATION_ZONES,
  CODENAMES_NAVIGATION_TARGETS,
  getCodenamesRuntimeBoardTargetId,
} = require(compiledTargetsPath)

assert.equal(typeof codenamesRuntimeNavigationProfile.resolveAction, 'function')

const boardToBoard = codenamesRuntimeNavigationProfile.resolveAction({
  context: { boardCardCount: 25, isStatusRailOpen: false },
  current: {
    zoneId: CODENAMES_NAVIGATION_ZONES.runtimeBoard,
    targetId: getCodenamesRuntimeBoardTargetId(12),
  },
  action: 'right',
})

assert.deepEqual(boardToBoard, {
  type: 'move',
  zoneId: CODENAMES_NAVIGATION_ZONES.runtimeBoard,
  targetId: getCodenamesRuntimeBoardTargetId(13),
})

const firstRowUp = codenamesRuntimeNavigationProfile.resolveAction({
  context: { boardCardCount: 25, isStatusRailOpen: false },
  current: {
    zoneId: CODENAMES_NAVIGATION_ZONES.runtimeBoard,
    targetId: getCodenamesRuntimeBoardTargetId(2),
  },
  action: 'up',
})

assert.deepEqual(firstRowUp, {
  type: 'move',
  zoneId: CODENAMES_NAVIGATION_ZONES.runtimeCenterControls,
  targetId: CODENAMES_NAVIGATION_TARGETS.runtimeCenterNewBoard,
})

const boardMenu = codenamesRuntimeNavigationProfile.resolveAction({
  context: { boardCardCount: 25, isStatusRailOpen: false },
  current: {
    zoneId: CODENAMES_NAVIGATION_ZONES.runtimeBoard,
    targetId: getCodenamesRuntimeBoardTargetId(12),
  },
  action: 'menu',
})

assert.deepEqual(boardMenu, {
  type: 'open-modal',
  screenId: 'codenames-runtime',
  zoneId: CODENAMES_NAVIGATION_ZONES.runtimeSettings,
  targetId: CODENAMES_NAVIGATION_TARGETS.runtimePauseSound,
})

const resetConfirm = codenamesRuntimeNavigationProfile.resolveAction({
  context: { boardCardCount: 25, isStatusRailOpen: false },
  current: {
    zoneId: CODENAMES_NAVIGATION_ZONES.runtimeCenterControls,
    targetId: CODENAMES_NAVIGATION_TARGETS.runtimeCenterNewBoard,
  },
  action: 'confirm',
})

assert.deepEqual(resetConfirm, {
  type: 'open-modal',
  screenId: 'codenames-runtime',
  zoneId: CODENAMES_NAVIGATION_ZONES.runtimeResetConfirm,
  targetId: CODENAMES_NAVIGATION_TARGETS.runtimeResetCancel,
})

const assassinMove = codenamesRuntimeNavigationProfile.resolveAction({
  context: { boardCardCount: 25, isStatusRailOpen: false },
  current: {
    zoneId: CODENAMES_NAVIGATION_ZONES.runtimeAssassin,
    targetId: CODENAMES_NAVIGATION_TARGETS.runtimeAssassinRed,
  },
  action: 'right',
})

assert.deepEqual(assassinMove, {
  type: 'move',
  zoneId: CODENAMES_NAVIGATION_ZONES.runtimeAssassin,
  targetId: CODENAMES_NAVIGATION_TARGETS.runtimeAssassinBlue,
})

console.log('Codenames runtime navigation profile behaves as expected.')

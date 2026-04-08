const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]
const builtInputModulePath = process.argv[3]

if (!builtModulePath) {
  throw new Error('Expected compiled host navigation engine module path as first argument.')
}

const engineModule = require(path.resolve(process.cwd(), builtModulePath))
const inputModule = builtInputModulePath ? require(path.resolve(process.cwd(), builtInputModulePath)) : null

function run(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    console.error(`not ok - ${name}`)
    throw error
  }
}

run('wakes without performing an action on the first keyboard input', () => {
  const state = engineModule.createHostNavigationState({
    screenId: 'menu',
    zoneId: 'content',
    targetId: 'play-now',
  })

  const nextState = engineModule.applyHostNavigationAction(state, {
    device: 'keyboard',
    transition: { type: 'move', zoneId: 'rail', targetId: 'settings' },
  })

  assert.equal(nextState.isAwake, true)
  assert.equal(nextState.zoneId, 'content')
  assert.equal(nextState.targetId, 'play-now')
  assert.equal(nextState.lastInputDevice, 'keyboard')
})

run('keeps controller wake guard active until the pad is neutral', () => {
  const sleepingState = engineModule.createHostNavigationState({
    screenId: 'menu',
    zoneId: 'content',
    targetId: 'play-now',
  })

  const wokenState = engineModule.applyHostNavigationAction(sleepingState, {
    device: 'controller',
    transition: { type: 'move', zoneId: 'rail', targetId: 'settings' },
  })

  assert.equal(wokenState.isControllerWakeGuardActive, true)

  const blockedState = engineModule.applyHostNavigationAction(wokenState, {
    device: 'controller',
    transition: { type: 'move', zoneId: 'rail', targetId: 'settings' },
  })

  assert.equal(blockedState.zoneId, 'content')
  assert.equal(blockedState.targetId, 'play-now')

  const releasedState = engineModule.updateControllerWakeGuard(blockedState, true)
  const actedState = engineModule.applyHostNavigationAction(releasedState, {
    device: 'controller',
    transition: { type: 'move', zoneId: 'rail', targetId: 'settings' },
  })

  assert.equal(actedState.zoneId, 'rail')
  assert.equal(actedState.targetId, 'settings')
})

run('restores focus origin after closing a modal', () => {
  const state = engineModule.createHostNavigationState({
    screenId: 'menu',
    zoneId: 'content',
    targetId: 'play-now',
    isAwake: true,
  })

  const modalState = engineModule.openHostNavigationModal(state, {
    screenId: 'settings-confirm',
    zoneId: 'dialog',
    targetId: 'save',
  })

  assert.equal(modalState.screenId, 'settings-confirm')
  assert.equal(modalState.modalOriginStack.length, 1)

  const restoredState = engineModule.closeHostNavigationModal(modalState)

  assert.equal(restoredState.screenId, 'menu')
  assert.equal(restoredState.zoneId, 'content')
  assert.equal(restoredState.targetId, 'play-now')
  assert.equal(restoredState.modalOriginStack.length, 0)
})

run('mouse sleep hides focus without forgetting the target', () => {
  const state = engineModule.createHostNavigationState({
    screenId: 'menu',
    zoneId: 'rail',
    targetId: 'settings',
    isAwake: true,
    lastInputDevice: 'controller',
  })

  const sleepingState = engineModule.sleepHostNavigation(state)

  assert.equal(sleepingState.isAwake, false)
  assert.equal(sleepingState.zoneId, 'rail')
  assert.equal(sleepingState.targetId, 'settings')
  assert.equal(sleepingState.lastInputDevice, 'mouse')
})

run('resolves keyboard aliases used by charades normalized labels', () => {
  assert.ok(inputModule)
  assert.equal(inputModule.resolveFixedHostNavigationAction('keyboard', 'Arrow Left'), 'left')
  assert.equal(inputModule.resolveFixedHostNavigationAction('keyboard', 'Arrow Right'), 'right')
  assert.equal(inputModule.resolveFixedHostNavigationAction('keyboard', 'Arrow Up'), 'up')
  assert.equal(inputModule.resolveFixedHostNavigationAction('keyboard', 'Arrow Down'), 'down')
  assert.equal(inputModule.resolveFixedHostNavigationAction('keyboard', 'Esc'), 'back')
})

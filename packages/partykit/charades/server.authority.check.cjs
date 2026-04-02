const assert = require('node:assert/strict')
const path = require('node:path')

const builtServerPath = process.argv[2]

if (!builtServerPath) {
  throw new Error('Expected compiled server path as first argument.')
}

const serverModule = require(path.resolve(process.cwd(), builtServerPath))

function createAuthorityState() {
  return {
    state: serverModule.applyEvent(serverModule.initialState, { type: 'DEVICE_CONNECTED' }),
    hostConnectionId: null,
    presenterConnectionId: null,
  }
}

function run(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    console.error(`not ok - ${name}`)
    throw error
  }
}

run('locks host authority to the first host sender', () => {
  assert.equal(typeof serverModule.reduceIncomingEvent, 'function')

  const start = serverModule.reduceIncomingEvent(createAuthorityState(), 'host-1', {
    type: 'TURN_START',
    turnId: 'turn-1',
    word: 'Kot',
    category: 'Zwierzeta',
    difficulty: 'easy',
    canChangeWord: false,
    remainingWordChanges: 0,
    presenterName: 'Ala',
    timerSeconds: 45,
    nextPresenterName: 'Bartek',
    nextPresenterAvatar: 'bear',
    nextStep: 'next-presenter',
  })

  assert.equal(start.accepted, true)
  assert.equal(start.hostConnectionId, 'host-1')

  const hijackAttempt = serverModule.reduceIncomingEvent(start, 'host-2', {
    type: 'TURN_END',
    turnId: 'turn-1',
    reason: 'manual-stop',
  })

  assert.equal(hijackAttempt.accepted, false)
  assert.equal(hijackAttempt.hostConnectionId, 'host-1')
  assert.equal(hijackAttempt.state.presenterPhase, 'your-turn')
})

run('accepts presenter events only from the active presenter connection', () => {
  const connected = serverModule.reduceIncomingEvent(createAuthorityState(), 'presenter-1', {
    type: 'DEVICE_CONNECTED',
  })

  assert.equal(connected.accepted, true)
  assert.equal(connected.presenterConnectionId, 'presenter-1')

  const wrongSenderReveal = serverModule.reduceIncomingEvent(connected, 'intruder', {
    type: 'WORD_REVEALED',
    turnId: 'turn-1',
  })

  assert.equal(wrongSenderReveal.accepted, false)

  const validReveal = serverModule.reduceIncomingEvent(connected, 'presenter-1', {
    type: 'WORD_REVEALED',
    turnId: 'turn-1',
  })

  assert.equal(validReveal.accepted, true)
})

run('releases host authority when the host connection closes', () => {
  assert.equal(typeof serverModule.handleConnectionClosed, 'function')

  const connected = serverModule.reduceIncomingEvent(createAuthorityState(), 'host-1', {
    type: 'TURN_START',
    turnId: 'turn-1',
    word: 'Kot',
    category: 'Zwierzeta',
    difficulty: 'easy',
    canChangeWord: false,
    remainingWordChanges: 0,
    presenterName: 'Ala',
    timerSeconds: 45,
    nextPresenterName: 'Bartek',
    nextPresenterAvatar: 'bear',
    nextStep: 'next-presenter',
  })

  const closed = serverModule.handleConnectionClosed(connected, 'host-1')
  assert.equal(closed.hostConnectionId, null)

  const reconnected = serverModule.reduceIncomingEvent(closed, 'host-2', {
    type: 'TURN_END',
    turnId: 'turn-1',
    reason: 'manual-stop',
  })

  assert.equal(reconnected.accepted, true)
  assert.equal(reconnected.hostConnectionId, 'host-2')
})

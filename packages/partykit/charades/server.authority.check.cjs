const assert = require('node:assert/strict')
const path = require('node:path')

const builtServerPath = process.argv[2]

if (!builtServerPath) {
  throw new Error('Expected compiled server path as first argument.')
}

const serverModule = require(path.resolve(process.cwd(), builtServerPath))

function createAuthorityState() {
  return {
    state: serverModule.initialState,
    hostConnectionId: null,
    presenterConnectionId: null,
  }
}

function connectPresenter(state = createAuthorityState(), presenterId = 'presenter-1') {
  return serverModule.reduceIncomingEvent(state, presenterId, {
    type: 'DEVICE_CONNECTED',
  })
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
  const connected = connectPresenter()

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

run('rejects a second presenter connection when one presenter is already paired', () => {
  const connected = connectPresenter()

  const hijackAttempt = serverModule.reduceIncomingEvent(connected, 'presenter-2', {
    type: 'DEVICE_CONNECTED',
  })

  assert.equal(hijackAttempt.accepted, false)
  assert.equal(hijackAttempt.presenterConnectionId, 'presenter-1')
  assert.deepEqual(hijackAttempt.directReply, { type: 'PRESENTER_SLOT_TAKEN' })
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

run('keeps presenter pairing on GAME_RESET and marks the presenter as host-left', () => {
  const connected = connectPresenter()

  const started = serverModule.reduceIncomingEvent(connected, 'host-1', {
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

  const reset = serverModule.reduceIncomingEvent(started, 'host-1', {
    type: 'GAME_RESET',
  })

  assert.equal(reset.accepted, true)
  assert.equal(reset.presenterConnectionId, 'presenter-1')
  assert.equal(reset.hostConnectionId, 'host-1')
  assert.equal(reset.state.presenterConnected, true)
  assert.equal(reset.state.presenterPhase, 'host-left')
})

run('allows host authority to be reacquired after GAME_RESET while keeping presenter pairing', () => {
  const connected = connectPresenter()

  const started = serverModule.reduceIncomingEvent(connected, 'host-1', {
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

  const reset = serverModule.reduceIncomingEvent(started, 'host-1', {
    type: 'GAME_RESET',
  })

  const closed = serverModule.handleConnectionClosed(reset, 'host-1')

  const resumed = serverModule.reduceIncomingEvent(closed, 'host-2', {
    type: 'TURN_START',
    turnId: 'turn-2',
    word: 'Okno',
    category: 'Dom',
    difficulty: 'easy',
    canChangeWord: false,
    remainingWordChanges: 0,
    presenterName: 'Ala',
    timerSeconds: 45,
    nextPresenterName: 'Jan',
    nextPresenterAvatar: 'bear',
    nextStep: 'next-presenter',
  })

  assert.equal(reset.accepted, true)
  assert.equal(closed.hostConnectionId, null)
  assert.equal(closed.presenterConnectionId, 'presenter-1')
  assert.equal(closed.state.presenterConnected, true)
  assert.equal(closed.state.presenterPhase, 'host-left')
  assert.equal(resumed.accepted, true)
  assert.equal(resumed.hostConnectionId, 'host-2')
  assert.equal(resumed.presenterConnectionId, 'presenter-1')
  assert.equal(resumed.state.presenterPhase, 'your-turn')
})

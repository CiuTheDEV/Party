const assert = require('node:assert/strict')
const path = require('node:path')

const builtServerPath = process.argv[2]

if (!builtServerPath) {
  throw new Error('Expected compiled server path as first argument.')
}

const serverModule = require(path.resolve(process.cwd(), builtServerPath))

function createRoom() {
  const broadcasts = []

  return {
    broadcasts,
    broadcast(message, excludedIds) {
      broadcasts.push({ message, excludedIds })
    },
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

function makeCards({ red = 0, blue = 0, assassin = 0, neutral = 0 } = {}) {
  const cards = []

  for (let i = 0; i < red; i += 1) cards.push({ word: `red-${i}`, color: 'red', revealed: false })
  for (let i = 0; i < blue; i += 1) cards.push({ word: `blue-${i}`, color: 'blue', revealed: false })
  for (let i = 0; i < assassin; i += 1) cards.push({ word: `assassin-${i}`, color: 'assassin', revealed: false })
  for (let i = 0; i < neutral; i += 1) cards.push({ word: `neutral-${i}`, color: 'neutral', revealed: false })

  while (cards.length < 25) {
    cards.push({ word: `pad-${cards.length}`, color: 'neutral', revealed: false })
  }

  return cards
}

function makeTeams() {
  return {
    redTeam: { name: 'Kutaski', avatar: 'fire' },
    blueTeam: { name: 'Cipeczki', avatar: 'unicorn' },
  }
}

run('echoes accepted host events back to the sender', () => {
  assert.equal(typeof serverModule.default, 'function')

  const room = createRoom()
  const server = new serverModule.default(room)

  server.onMessage(JSON.stringify({ type: 'GAME_RESET' }), { id: 'host-1' })

  assert.equal(room.broadcasts.length, 1)
  assert.equal(room.broadcasts[0].excludedIds, undefined)
  assert.deepEqual(JSON.parse(room.broadcasts[0].message), { type: 'GAME_RESET' })
  assert.equal(server.hostConnectionId, 'host-1')
})

run('rejects game start when captains are not connected', () => {
  const room = createRoom()
  const server = new serverModule.default(room)

  server.onMessage(
    JSON.stringify({
      type: 'GAME_START',
      cards: makeCards({ red: 1, blue: 1, neutral: 23 }),
      redTotal: 1,
      blueTotal: 1,
      startingTeam: 'red',
    }),
    { id: 'host-1' },
  )

  assert.equal(room.broadcasts.length, 0)
  assert.equal(server.state.phase, 'waiting')
  assert.equal(server.state.hostConnected, false)
})

run('accepts game start only after both captains connect', () => {
  const room = createRoom()
  const server = new serverModule.default(room)

  server.onMessage(JSON.stringify({ type: 'CAPTAIN_CONNECTED', team: 'red' }), { id: 'captain-red' })
  server.onMessage(JSON.stringify({ type: 'CAPTAIN_CONNECTED', team: 'blue' }), { id: 'captain-blue' })
  server.onMessage(
    JSON.stringify({
      type: 'GAME_START',
      cards: makeCards({ red: 1, blue: 1, neutral: 23 }),
      redTotal: 1,
      blueTotal: 1,
      startingTeam: 'red',
    }),
    { id: 'host-1' },
  )

  assert.equal(server.state.phase, 'playing')
  assert.equal(server.state.boardUnlocked, false)
  assert.equal(server.state.captainRedReady, false)
  assert.equal(server.state.captainBlueReady, false)
  assert.equal(server.state.hostConnected, true)
  assert.ok(room.broadcasts.some((entry) => JSON.parse(entry.message).type === 'GAME_START'))
})

run('unlocks the board only after both captains confirm ready', () => {
  const room = createRoom()
  const server = new serverModule.default(room)

  server.onMessage(JSON.stringify({ type: 'CAPTAIN_CONNECTED', team: 'red' }), { id: 'captain-red' })
  server.onMessage(JSON.stringify({ type: 'CAPTAIN_CONNECTED', team: 'blue' }), { id: 'captain-blue' })
  server.onMessage(
    JSON.stringify({
      type: 'GAME_START',
      cards: makeCards({ red: 1, blue: 1, neutral: 23 }),
      redTotal: 1,
      blueTotal: 1,
      startingTeam: 'red',
    }),
    { id: 'host-1' },
  )

  server.onMessage(JSON.stringify({ type: 'CAPTAIN_READY', team: 'red' }), { id: 'captain-red' })

  assert.equal(server.state.captainRedReady, true)
  assert.equal(server.state.captainBlueReady, false)
  assert.equal(server.state.boardUnlocked, false)

  server.onMessage(JSON.stringify({ type: 'CAPTAIN_READY', team: 'blue' }), { id: 'captain-blue' })

  assert.equal(server.state.captainRedReady, true)
  assert.equal(server.state.captainBlueReady, true)
  assert.equal(server.state.boardUnlocked, true)
})

run('increments the winning team after all opposing cards are revealed', () => {
  const room = createRoom()
  const server = new serverModule.default(room)

  server.onMessage(JSON.stringify({ type: 'CAPTAIN_CONNECTED', team: 'red' }), { id: 'captain-red' })
  server.onMessage(JSON.stringify({ type: 'CAPTAIN_CONNECTED', team: 'blue' }), { id: 'captain-blue' })
  server.onMessage(
    JSON.stringify({
      type: 'GAME_START',
      cards: makeCards({ red: 1, neutral: 24 }),
      redTotal: 1,
      blueTotal: 0,
      startingTeam: 'red',
    }),
    { id: 'host-1' },
  )
  server.onMessage(JSON.stringify({ type: 'CAPTAIN_READY', team: 'red' }), { id: 'captain-red' })
  server.onMessage(JSON.stringify({ type: 'CAPTAIN_READY', team: 'blue' }), { id: 'captain-blue' })

  server.onMessage(JSON.stringify({ type: 'CARD_REVEAL', index: 0 }), { id: 'host-1' })

  assert.equal(server.state.phase, 'ended')
  assert.equal(server.state.winner, 'red')
  assert.equal(server.state.roundWinsRed, 1)
  assert.equal(server.state.roundWinsBlue, 0)
})

run('preserves round wins after reset', () => {
  const room = createRoom()
  const server = new serverModule.default(room)

  server.onMessage(JSON.stringify({ type: 'CAPTAIN_CONNECTED', team: 'red' }), { id: 'captain-red' })
  server.onMessage(JSON.stringify({ type: 'CAPTAIN_CONNECTED', team: 'blue' }), { id: 'captain-blue' })
  server.onMessage(
    JSON.stringify({
      type: 'GAME_START',
      cards: makeCards({ blue: 1, neutral: 24 }),
      redTotal: 1,
      blueTotal: 1,
      startingTeam: 'blue',
    }),
    { id: 'host-1' },
  )
  server.onMessage(JSON.stringify({ type: 'CAPTAIN_READY', team: 'red' }), { id: 'captain-red' })
  server.onMessage(JSON.stringify({ type: 'CAPTAIN_READY', team: 'blue' }), { id: 'captain-blue' })

  server.onMessage(JSON.stringify({ type: 'CARD_REVEAL', index: 0 }), { id: 'host-1' })
  server.onMessage(JSON.stringify({ type: 'GAME_RESET' }), { id: 'host-1' })

  assert.equal(server.state.roundWinsBlue, 1)
  assert.equal(server.state.roundWinsRed, 0)
  assert.equal(server.state.phase, 'waiting')
  assert.equal(server.state.boardUnlocked, false)
  assert.equal(server.state.captainRedReady, false)
  assert.equal(server.state.captainBlueReady, false)
})

run('increments the losing team after assassin selection', () => {
  const room = createRoom()
  const server = new serverModule.default(room)

  server.onMessage(JSON.stringify({ type: 'CAPTAIN_CONNECTED', team: 'red' }), { id: 'captain-red' })
  server.onMessage(JSON.stringify({ type: 'CAPTAIN_CONNECTED', team: 'blue' }), { id: 'captain-blue' })
  server.onMessage(
    JSON.stringify({
      type: 'GAME_START',
      cards: makeCards({ assassin: 1, neutral: 24 }),
      redTotal: 1,
      blueTotal: 1,
      startingTeam: 'red',
    }),
    { id: 'host-1' },
  )
  server.onMessage(JSON.stringify({ type: 'CAPTAIN_READY', team: 'red' }), { id: 'captain-red' })
  server.onMessage(JSON.stringify({ type: 'CAPTAIN_READY', team: 'blue' }), { id: 'captain-blue' })

  server.onMessage(JSON.stringify({ type: 'CARD_REVEAL', index: 0 }), { id: 'host-1' })
  server.onMessage(JSON.stringify({ type: 'ASSASSIN_TEAM', team: 'red' }), { id: 'host-1' })

  assert.equal(server.state.phase, 'ended')
  assert.equal(server.state.winner, 'blue')
  assert.equal(server.state.roundWinsBlue, 1)
  assert.equal(server.state.roundWinsRed, 0)
})

run('resets the whole match after match reset', () => {
  const room = createRoom()
  const server = new serverModule.default(room)

  server.onMessage(JSON.stringify({ type: 'CAPTAIN_CONNECTED', team: 'red' }), { id: 'captain-red' })
  server.onMessage(JSON.stringify({ type: 'CAPTAIN_CONNECTED', team: 'blue' }), { id: 'captain-blue' })
  server.onMessage(
    JSON.stringify({
      type: 'GAME_START',
      cards: makeCards({ red: 1, neutral: 24 }),
      redTotal: 1,
      blueTotal: 1,
      startingTeam: 'red',
    }),
    { id: 'host-1' },
  )
  server.onMessage(JSON.stringify({ type: 'CAPTAIN_READY', team: 'red' }), { id: 'captain-red' })
  server.onMessage(JSON.stringify({ type: 'CAPTAIN_READY', team: 'blue' }), { id: 'captain-blue' })

  server.onMessage(JSON.stringify({ type: 'CARD_REVEAL', index: 0 }), { id: 'host-1' })
  server.onMessage(JSON.stringify({ type: 'MATCH_RESET' }), { id: 'host-1' })

  assert.equal(server.state.phase, 'waiting')
  assert.equal(server.state.roundWinsRed, 0)
  assert.equal(server.state.roundWinsBlue, 0)
  assert.equal(server.state.winner, null)
  assert.equal(server.state.assassinTeam, null)
  assert.equal(room.broadcasts.length, 9)
  assert.equal(JSON.parse(room.broadcasts[7].message).type, 'MATCH_RESET')
  assert.deepEqual(JSON.parse(room.broadcasts[8].message), {
    type: 'ROOM_STATE',
    state: server.state,
  })
})

run('broadcasts host disconnected when host closes', () => {
  const room = createRoom()
  const server = new serverModule.default(room)

  server.onMessage(JSON.stringify({ type: 'CAPTAIN_CONNECTED', team: 'red' }), { id: 'captain-red' })
  server.onMessage(JSON.stringify({ type: 'CAPTAIN_CONNECTED', team: 'blue' }), { id: 'captain-blue' })
  server.onMessage(JSON.stringify({ type: 'GAME_RESET' }), { id: 'host-1' })

  server.onClose({ id: 'host-1' })

  assert.equal(server.state.hostConnected, false)
  assert.equal(JSON.parse(room.broadcasts[room.broadcasts.length - 1].message).type, 'HOST_DISCONNECTED')
})

run('broadcasts host connected when the host reconnects', () => {
  const room = createRoom()
  const server = new serverModule.default(room)

  server.onMessage(JSON.stringify({ type: 'HOST_CONNECTED', ...makeTeams() }), { id: 'host-1' })
  server.onClose({ id: 'host-1' })
  server.onMessage(JSON.stringify({ type: 'HOST_CONNECTED', ...makeTeams() }), { id: 'host-1' })

  assert.equal(server.state.hostConnected, true)
  assert.equal(JSON.parse(room.broadcasts[room.broadcasts.length - 1].message).type, 'HOST_CONNECTED')
})

run('allows a new host to reclaim a waiting room and clears stale captain seats', () => {
  const room = createRoom()
  const server = new serverModule.default(room)

  server.hostConnectionId = 'host-stale'
  server.captainRedConnectionId = 'captain-red-stale'
  server.captainBlueConnectionId = 'captain-blue-stale'
  server.state = {
    ...server.state,
    hostConnected: true,
    captainRedConnected: true,
    captainBlueConnected: true,
  }

  server.onMessage(JSON.stringify({ type: 'HOST_CONNECTED', ...makeTeams() }), { id: 'host-fresh' })

  assert.equal(server.hostConnectionId, 'host-fresh')
  assert.equal(server.captainRedConnectionId, null)
  assert.equal(server.captainBlueConnectionId, null)
  assert.equal(server.state.hostConnected, true)
  assert.equal(server.state.captainRedConnected, false)
  assert.equal(server.state.captainBlueConnected, false)
  assert.equal(room.broadcasts.length, 2)
  assert.equal(JSON.parse(room.broadcasts[0].message).type, 'HOST_CONNECTED')
  assert.deepEqual(JSON.parse(room.broadcasts[1].message), {
    type: 'ROOM_STATE',
    state: server.state,
  })
})

run('setup host reclaims a stale runtime and resets the room back to waiting', () => {
  const room = createRoom()
  const server = new serverModule.default(room)

  server.hostConnectionId = 'host-stale'
  server.captainRedConnectionId = 'captain-red-stale'
  server.captainBlueConnectionId = 'captain-blue-stale'
  server.state = {
    ...server.state,
    phase: 'ended',
    hostConnected: false,
    captainRedConnected: true,
    captainBlueConnected: true,
    boardUnlocked: true,
    captainRedReady: true,
    captainBlueReady: true,
    cards: makeCards({ red: 1, blue: 1, neutral: 23 }),
    winner: 'red',
  }

  server.onMessage(JSON.stringify({ type: 'HOST_SETUP_CONNECTED', ...makeTeams() }), { id: 'host-setup' })

  assert.equal(server.hostConnectionId, 'host-setup')
  assert.equal(server.captainRedConnectionId, null)
  assert.equal(server.captainBlueConnectionId, null)
  assert.equal(server.state.phase, 'waiting')
  assert.equal(server.state.hostConnected, true)
  assert.equal(server.state.captainRedConnected, false)
  assert.equal(server.state.captainBlueConnected, false)
  assert.equal(server.state.boardUnlocked, false)
  assert.equal(room.broadcasts.length, 2)
  assert.equal(JSON.parse(room.broadcasts[0].message).type, 'HOST_SETUP_CONNECTED')
  assert.deepEqual(JSON.parse(room.broadcasts[1].message), {
    type: 'ROOM_STATE',
    state: server.state,
  })
})

run('setup host keeps already paired captains while the room is still waiting', () => {
  const room = createRoom()
  const server = new serverModule.default(room)

  server.state = {
    ...server.state,
    phase: 'waiting',
    hostConnected: false,
    captainRedConnected: true,
    captainBlueConnected: true,
  }
  server.captainRedConnectionId = 'captain-red'
  server.captainBlueConnectionId = 'captain-blue'

  server.onMessage(JSON.stringify({ type: 'HOST_SETUP_CONNECTED', ...makeTeams() }), { id: 'host-setup' })

  assert.equal(server.hostConnectionId, 'host-setup')
  assert.equal(server.state.phase, 'waiting')
  assert.equal(server.state.hostConnected, true)
  assert.equal(server.state.captainRedConnected, true)
  assert.equal(server.state.captainBlueConnected, true)
  assert.equal(server.captainRedConnectionId, 'captain-red')
  assert.equal(server.captainBlueConnectionId, 'captain-blue')
  assert.equal(room.broadcasts.length, 1)
  assert.equal(JSON.parse(room.broadcasts[0].message).type, 'HOST_SETUP_CONNECTED')
})

run('ignores card reveals that point past the loaded board', () => {
  const room = createRoom()
  const server = new serverModule.default(room)

  server.state = {
    ...server.state,
    phase: 'playing',
    cards: [],
    redTotal: 1,
    blueTotal: 1,
    hostConnected: true,
    captainRedConnected: true,
    captainBlueConnected: true,
  }

  assert.doesNotThrow(() => {
    server.onMessage(JSON.stringify({ type: 'CARD_REVEAL', index: 0 }), { id: 'host-1' })
  })
  assert.equal(room.broadcasts.length, 0)
})

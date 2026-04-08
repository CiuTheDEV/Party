const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled runtime helper module path as first argument.')
}

const runtimeHelpers = require(path.resolve(process.cwd(), builtModulePath))

function run(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    console.error(`not ok - ${name}`)
    throw error
  }
}

function createSettings() {
  return {
    rounds: 2,
    timerSeconds: 45,
    wordChange: {
      enabled: true,
      changesPerPlayer: 2,
      rerollScope: 'word-only',
    },
    hints: {
      enabled: true,
      showCategory: true,
      showWordCount: false,
    },
  }
}

function createPlayers() {
  return [
    { name: 'Ala', avatar: 'fox', gender: 'ona', score: 0 },
    { name: 'Bartek', avatar: 'bear', gender: 'on', score: 0 },
  ]
}

run('creates the next turn payload from a pending prepare state', () => {
  const settings = createSettings()
  const nextWordCalls = []
  const turnPlan = runtimeHelpers.createPendingTurnStart({
    state: {
      phase: 'prepare',
      players: createPlayers(),
      remainingWordChangesByPlayer: [2, 2],
      rejectedPromptKeysThisTurn: [],
      order: [1, 0],
      isRoundOrderRevealing: false,
      currentOrderIdx: 0,
      currentRound: 1,
      totalRounds: 2,
      timerRemaining: 45,
      bufferRemaining: 10,
      currentWord: '',
      currentCategory: '',
      currentDifficulty: '',
      isDeviceConnected: true,
      isRoomConnected: true,
    },
    settings,
    createTurnId: () => 'turn-123',
    getNextWord: (playerKey) => {
      nextWordCalls.push(playerKey)
      return { word: 'Rakieta', category: 'Kosmos', difficulty: 'hard' }
    },
  })

  assert.deepEqual(nextWordCalls, ['Bartek::bear::on'])
  assert.equal(turnPlan.turnId, 'turn-123')
  assert.deepEqual(turnPlan.hostEvent, {
    type: 'TURN_START',
    turnId: 'turn-123',
    word: 'Rakieta',
    category: 'Kosmos',
    difficulty: 'hard',
    canChangeWord: true,
    remainingWordChanges: 2,
    presenterName: 'Bartek',
    timerSeconds: 45,
    nextPresenterName: 'Ala',
    nextPresenterAvatar: 'fox',
    nextStep: 'next-presenter',
  })
  assert.equal(turnPlan.nextState.currentWord, 'Rakieta')
  assert.equal(turnPlan.nextState.currentCategory, 'Kosmos')
  assert.equal(turnPlan.nextState.currentDifficulty, 'hard')
})

run('creates a word-changed sync event for a reveal-buffer reroll', () => {
  const settings = createSettings()
  const wordChange = runtimeHelpers.resolvePendingWordChange({
    state: {
      phase: 'reveal-buffer',
      players: createPlayers(),
      remainingWordChangesByPlayer: [2, 2],
      rejectedPromptKeysThisTurn: [],
      order: [0, 1],
      isRoundOrderRevealing: false,
      currentOrderIdx: 0,
      currentRound: 1,
      totalRounds: 2,
      timerRemaining: 45,
      bufferRemaining: 10,
      currentWord: 'Lew',
      currentCategory: 'Zwierzeta',
      currentDifficulty: 'easy',
      isDeviceConnected: true,
      isRoomConnected: true,
    },
    settings,
    currentTurnId: 'turn-abc',
    requestedTurnId: 'turn-abc',
    getWordOnlyReroll: ({ playerKey, currentPrompt, rejectedPromptKeysThisTurn }) => {
      assert.equal(playerKey, 'Ala::fox::ona')
      assert.deepEqual(currentPrompt, {
        word: 'Lew',
        category: 'Zwierzeta',
        difficulty: 'easy',
      })
      assert.deepEqual(rejectedPromptKeysThisTurn, [])
      return {
        word: 'Tygrys',
        category: 'Zwierzeta',
        difficulty: 'easy',
      }
    },
    getWordAndCategoryReroll: () => {
      throw new Error('Expected word-only reroll path.')
    },
  })

  assert.equal(wordChange.playerKey, 'Ala::fox::ona')
  assert.deepEqual(wordChange.rejectedPrompt, {
    word: 'Lew',
    category: 'Zwierzeta',
    difficulty: 'easy',
  })
  assert.deepEqual(wordChange.hostEvent, {
    type: 'WORD_CHANGED',
    turnId: 'turn-abc',
    word: 'Tygrys',
    category: 'Zwierzeta',
    difficulty: 'easy',
    remainingWordChanges: 1,
  })
  assert.equal(wordChange.nextState.currentWord, 'Tygrys')
  assert.deepEqual(wordChange.nextState.remainingWordChangesByPlayer, [1, 2])
  assert.deepEqual(wordChange.nextState.rejectedPromptKeysThisTurn, ['Lew::Zwierzeta::easy'])
})

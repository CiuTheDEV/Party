const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled host controls module path as first argument.')
}

const hostControlsModule = require(path.resolve(process.cwd(), builtModulePath))

function run(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    console.error(`not ok - ${name}`)
    throw error
  }
}

run('maps persisted keyboard binding labels to semantic actions', () => {
  assert.equal(
    hostControlsModule.resolveHostControlAction(
      {
        'keyboard-primary:primary': 'F',
        'keyboard-primary:secondary': '',
      },
      'keyboard',
      'F',
    ),
    'primary',
  )

  assert.equal(
    hostControlsModule.resolveHostControlAction(
      {
        'keyboard-primary:primary': 'F',
        'keyboard-primary:secondary': '',
      },
      'keyboard',
      'Space',
    ),
    null,
  )
})

run('returns display labels for action hints on both devices', () => {
  assert.equal(
    hostControlsModule.getHostControlActionLabel(
      {
        'keyboard-primary:primary': 'F',
        'keyboard-primary:secondary': 'Space',
        'controller-primary:primary': 'R1 / RB',
        'controller-primary:secondary': '',
      },
      'keyboard',
      'primary',
    ),
    'F / Space',
  )

  assert.equal(
    hostControlsModule.getHostControlActionLabel(
      {
        'keyboard-primary:primary': 'F',
        'keyboard-primary:secondary': 'Space',
        'controller-primary:primary': 'R1 / RB',
        'controller-primary:secondary': 'L2 / LT',
      },
      'controller',
      'primary',
    ),
    'R1 / RB / L2 / LT',
  )
})

run('opens settings from menu action and closes it on repeat', () => {
  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'prepare',
        isRoundOrderRevealing: false,
        isSettingsOpen: false,
        isSettingsExitConfirmOpen: false,
        isVerdictPickerOpen: false,
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [],
        isReconnectBlocking: false,
        canToggleScoreRail: true,
        isVerdictWordVisible: false,
      },
      'menu',
    ),
    { type: 'open-settings' },
  )

  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'prepare',
        isRoundOrderRevealing: false,
        isSettingsOpen: true,
        isSettingsExitConfirmOpen: false,
        isVerdictPickerOpen: false,
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [],
        isReconnectBlocking: false,
        canToggleScoreRail: true,
        isVerdictWordVisible: false,
      },
      'menu',
    ),
    { type: 'close-settings' },
  )
})

run('suppresses host controls while reconnect overlay blocks the screen', () => {
  assert.equal(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'round-order',
        isRoundOrderRevealing: false,
        isSettingsOpen: false,
        isSettingsExitConfirmOpen: false,
        isVerdictPickerOpen: false,
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [],
        isReconnectBlocking: true,
        canToggleScoreRail: false,
        isVerdictWordVisible: false,
      },
      'primary',
    ),
    null,
  )
})

run('maps primary and secondary actions during verdict', () => {
  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'verdict',
        isRoundOrderRevealing: false,
        isSettingsOpen: false,
        isSettingsExitConfirmOpen: false,
        isVerdictPickerOpen: false,
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [1, 3, 4],
        isReconnectBlocking: false,
        canToggleScoreRail: false,
        isVerdictWordVisible: false,
      },
      'primary',
    ),
    { type: 'open-verdict-picker' },
  )

  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'verdict',
        isRoundOrderRevealing: false,
        isSettingsOpen: false,
        isSettingsExitConfirmOpen: false,
        isVerdictPickerOpen: false,
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [1, 3, 4],
        isReconnectBlocking: false,
        canToggleScoreRail: false,
        isVerdictWordVisible: false,
      },
      'secondary',
    ),
    { type: 'give-incorrect-verdict' },
  )
})

run('navigates verdict picker and confirms selected player', () => {
  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'verdict',
        isRoundOrderRevealing: false,
        isSettingsOpen: false,
        isSettingsExitConfirmOpen: false,
        isVerdictPickerOpen: true,
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [1, 3, 4],
        isReconnectBlocking: false,
        canToggleScoreRail: false,
        isVerdictWordVisible: false,
      },
      'right',
    ),
    { type: 'select-verdict-player', playerIdx: 1 },
  )

  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'verdict',
        isRoundOrderRevealing: false,
        isSettingsOpen: false,
        isSettingsExitConfirmOpen: false,
        isVerdictPickerOpen: true,
        selectedGuessedPlayerIdx: 3,
        guessedPlayerIndexes: [1, 3, 4],
        isReconnectBlocking: false,
        canToggleScoreRail: false,
        isVerdictWordVisible: false,
      },
      'left',
    ),
    { type: 'select-verdict-player', playerIdx: 1 },
  )

  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'verdict',
        isRoundOrderRevealing: false,
        isSettingsOpen: false,
        isSettingsExitConfirmOpen: false,
        isVerdictPickerOpen: true,
        selectedGuessedPlayerIdx: 3,
        guessedPlayerIndexes: [1, 3, 4],
        isReconnectBlocking: false,
        canToggleScoreRail: false,
        isVerdictWordVisible: false,
      },
      'confirm',
    ),
    { type: 'confirm-verdict-player' },
  )
})

run('maps contextual host actions for round flow and verdict word toggle', () => {
  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'round-order',
        isRoundOrderRevealing: false,
        isSettingsOpen: false,
        isSettingsExitConfirmOpen: false,
        isVerdictPickerOpen: false,
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [],
        isReconnectBlocking: false,
        canToggleScoreRail: false,
        isVerdictWordVisible: false,
      },
      'primary',
    ),
    { type: 'start-round-order' },
  )

  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'prepare',
        isRoundOrderRevealing: false,
        isSettingsOpen: false,
        isSettingsExitConfirmOpen: false,
        isVerdictPickerOpen: false,
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [],
        isReconnectBlocking: false,
        canToggleScoreRail: true,
        isVerdictWordVisible: false,
      },
      'rail',
    ),
    { type: 'toggle-score-rail' },
  )

  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'timer-running',
        isRoundOrderRevealing: false,
        isSettingsOpen: false,
        isSettingsExitConfirmOpen: false,
        isVerdictPickerOpen: false,
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [],
        isReconnectBlocking: false,
        canToggleScoreRail: false,
        isVerdictWordVisible: false,
      },
      'primary',
    ),
    { type: 'stop-round' },
  )

  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'round-summary',
        isRoundOrderRevealing: false,
        isSettingsOpen: false,
        isSettingsExitConfirmOpen: false,
        isVerdictPickerOpen: false,
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [],
        isReconnectBlocking: false,
        canToggleScoreRail: false,
        isVerdictWordVisible: false,
      },
      'primary',
    ),
    { type: 'continue-round-summary' },
  )

  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'verdict',
        isRoundOrderRevealing: false,
        isSettingsOpen: false,
        isSettingsExitConfirmOpen: false,
        isVerdictPickerOpen: false,
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [1, 3, 4],
        isReconnectBlocking: false,
        canToggleScoreRail: false,
        isVerdictWordVisible: false,
      },
      'rail',
    ),
    { type: 'toggle-verdict-word' },
  )
})

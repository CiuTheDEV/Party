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
        'keyboard-confirm:primary': 'F',
        'keyboard-confirm:secondary': '',
      },
      'keyboard',
      'F',
    ),
    'confirm',
  )

  assert.equal(
    hostControlsModule.resolveHostControlAction(
      {
        'keyboard-confirm:primary': 'F',
        'keyboard-confirm:secondary': '',
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
        'keyboard-confirm:primary': 'F',
        'keyboard-confirm:secondary': 'Space',
        'controller-confirm:primary': 'A / Cross',
        'controller-confirm:secondary': '',
      },
      'keyboard',
      'confirm',
    ),
    'F / Space',
  )

  assert.equal(
    hostControlsModule.getHostControlActionLabel(
      {
        'keyboard-confirm:primary': 'F',
        'keyboard-confirm:secondary': 'Space',
        'controller-confirm:primary': 'A / Cross',
        'controller-confirm:secondary': 'X / Square',
      },
      'controller',
      'confirm',
    ),
    'A / Cross / X / Square',
  )

  assert.equal(
    hostControlsModule.getFixedRuntimeOverlayActionLabel('keyboard', 'confirm'),
    'Enter',
  )

  assert.equal(
    hostControlsModule.getFixedRuntimeOverlayActionLabel('controller', 'back'),
    'B / Circle',
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
        settingsFocusTarget: 'sound',
        settingsExitConfirmFocusTarget: 'stay',
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
        settingsFocusTarget: 'continue',
        settingsExitConfirmFocusTarget: 'stay',
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

run('settings menu is intended to enter on the first vertical item', () => {
  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'prepare',
        isRoundOrderRevealing: false,
        isSettingsOpen: true,
        isSettingsExitConfirmOpen: false,
        settingsFocusTarget: 'sound',
        settingsExitConfirmFocusTarget: 'stay',
        isVerdictPickerOpen: false,
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [],
        isReconnectBlocking: false,
        canToggleScoreRail: true,
        isVerdictWordVisible: false,
      },
      'down',
    ),
    { type: 'set-settings-focus', target: 'animations' },
  )
})

run('navigates runtime settings modal targets and resolves primary contextually', () => {
  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'prepare',
        isRoundOrderRevealing: false,
        isSettingsOpen: true,
        isSettingsExitConfirmOpen: false,
        settingsFocusTarget: 'sound',
        settingsExitConfirmFocusTarget: 'stay',
        isVerdictPickerOpen: false,
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [],
        isReconnectBlocking: false,
        canToggleScoreRail: true,
        isVerdictWordVisible: false,
      },
      'down',
    ),
    { type: 'set-settings-focus', target: 'animations' },
  )

  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'prepare',
        isRoundOrderRevealing: false,
        isSettingsOpen: true,
        isSettingsExitConfirmOpen: false,
        settingsFocusTarget: 'animations',
        settingsExitConfirmFocusTarget: 'stay',
        isVerdictPickerOpen: false,
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [],
        isReconnectBlocking: false,
        canToggleScoreRail: true,
        isVerdictWordVisible: false,
      },
      'down',
    ),
    { type: 'set-settings-focus', target: 'exit' },
  )

  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'prepare',
        isRoundOrderRevealing: false,
        isSettingsOpen: true,
        isSettingsExitConfirmOpen: false,
        settingsFocusTarget: 'exit',
        settingsExitConfirmFocusTarget: 'stay',
        isVerdictPickerOpen: false,
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [],
        isReconnectBlocking: false,
        canToggleScoreRail: true,
        isVerdictWordVisible: false,
      },
      'down',
    ),
    { type: 'set-settings-focus', target: 'continue' },
  )

  assert.equal(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'prepare',
        isRoundOrderRevealing: false,
        isSettingsOpen: true,
        isSettingsExitConfirmOpen: false,
        settingsFocusTarget: 'sound',
        settingsExitConfirmFocusTarget: 'stay',
        isVerdictPickerOpen: false,
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [],
        isReconnectBlocking: false,
        canToggleScoreRail: true,
        isVerdictWordVisible: false,
      },
      'right',
    ),
    null,
  )

  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'prepare',
        isRoundOrderRevealing: false,
        isSettingsOpen: true,
        isSettingsExitConfirmOpen: false,
        settingsFocusTarget: 'exit',
        settingsExitConfirmFocusTarget: 'stay',
        isVerdictPickerOpen: false,
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [],
        isReconnectBlocking: false,
        canToggleScoreRail: true,
        isVerdictWordVisible: false,
      },
      'right',
    ),
    { type: 'set-settings-focus', target: 'continue' },
  )

  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'prepare',
        isRoundOrderRevealing: false,
        isSettingsOpen: true,
        isSettingsExitConfirmOpen: false,
        settingsFocusTarget: 'continue',
        settingsExitConfirmFocusTarget: 'stay',
        isVerdictPickerOpen: false,
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [],
        isReconnectBlocking: false,
        canToggleScoreRail: true,
        isVerdictWordVisible: false,
      },
      'left',
    ),
    { type: 'set-settings-focus', target: 'exit' },
  )

  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'prepare',
        isRoundOrderRevealing: false,
        isSettingsOpen: true,
        isSettingsExitConfirmOpen: false,
        settingsFocusTarget: 'sound',
        settingsExitConfirmFocusTarget: 'stay',
        isVerdictPickerOpen: false,
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [],
        isReconnectBlocking: false,
        canToggleScoreRail: true,
        isVerdictWordVisible: false,
      },
      'confirm',
    ),
    { type: 'toggle-settings-sound' },
  )

  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'prepare',
        isRoundOrderRevealing: false,
        isSettingsOpen: true,
        isSettingsExitConfirmOpen: false,
        settingsFocusTarget: 'exit',
        settingsExitConfirmFocusTarget: 'stay',
        isVerdictPickerOpen: false,
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [],
        isReconnectBlocking: false,
        canToggleScoreRail: true,
        isVerdictWordVisible: false,
      },
      'confirm',
    ),
    { type: 'open-settings-exit-confirm' },
  )
})

run('navigates settings exit confirm and confirms selected action', () => {
  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'prepare',
        isRoundOrderRevealing: false,
        isSettingsOpen: true,
        isSettingsExitConfirmOpen: true,
        settingsFocusTarget: 'continue',
        settingsExitConfirmFocusTarget: 'stay',
        isVerdictPickerOpen: false,
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [],
        isReconnectBlocking: false,
        canToggleScoreRail: true,
        isVerdictWordVisible: false,
      },
      'down',
    ),
    null,
  )

  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'prepare',
        isRoundOrderRevealing: false,
        isSettingsOpen: true,
        isSettingsExitConfirmOpen: true,
        settingsFocusTarget: 'continue',
        settingsExitConfirmFocusTarget: 'stay',
        isVerdictPickerOpen: false,
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [],
        isReconnectBlocking: false,
        canToggleScoreRail: true,
        isVerdictWordVisible: false,
      },
      'left',
    ),
    { type: 'set-settings-exit-confirm-focus', target: 'exit' },
  )

  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'prepare',
        isRoundOrderRevealing: false,
        isSettingsOpen: true,
        isSettingsExitConfirmOpen: true,
        settingsFocusTarget: 'continue',
        settingsExitConfirmFocusTarget: 'stay',
        isVerdictPickerOpen: false,
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [],
        isReconnectBlocking: false,
        canToggleScoreRail: true,
        isVerdictWordVisible: false,
      },
      'confirm',
    ),
    { type: 'cancel-settings-exit-confirm' },
  )

  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'prepare',
        isRoundOrderRevealing: false,
        isSettingsOpen: true,
        isSettingsExitConfirmOpen: true,
        settingsFocusTarget: 'continue',
        settingsExitConfirmFocusTarget: 'exit',
        isVerdictPickerOpen: false,
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [],
        isReconnectBlocking: false,
        canToggleScoreRail: true,
        isVerdictWordVisible: false,
      },
      'confirm',
    ),
    { type: 'exit-to-menu' },
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
      'confirm',
    ),
    null,
  )
})

run('maps runtime verdict actions through primary and directional choice', () => {
  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'verdict',
        isRoundOrderRevealing: false,
        isSettingsOpen: false,
        isSettingsExitConfirmOpen: false,
        verdictFocusTarget: 'correct',
        isVerdictPickerOpen: false,
        verdictPickerStage: 'players',
        verdictPickerActionTarget: 'confirm',
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [1, 3, 4],
        isReconnectBlocking: false,
        canToggleScoreRail: false,
        isVerdictWordVisible: false,
      },
      'right',
    ),
    { type: 'set-verdict-focus', target: 'incorrect' },
  )

  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'verdict',
        isRoundOrderRevealing: false,
        isSettingsOpen: false,
        isSettingsExitConfirmOpen: false,
        verdictFocusTarget: 'incorrect',
        isVerdictPickerOpen: false,
        verdictPickerStage: 'players',
        verdictPickerActionTarget: 'confirm',
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [1, 3, 4],
        isReconnectBlocking: false,
        canToggleScoreRail: false,
        isVerdictWordVisible: false,
      },
      'confirm',
    ),
    { type: 'open-incorrect-verdict-confirm' },
  )

  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'verdict',
        isRoundOrderRevealing: false,
        isSettingsOpen: false,
        isSettingsExitConfirmOpen: false,
        isIncorrectVerdictConfirmOpen: true,
        verdictFocusTarget: 'incorrect',
        isVerdictPickerOpen: false,
        incorrectVerdictConfirmFocusTarget: 'confirm',
        verdictPickerStage: 'players',
        verdictPickerActionTarget: 'confirm',
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [1, 3, 4],
        isReconnectBlocking: false,
        canToggleScoreRail: false,
        isVerdictWordVisible: false,
      },
      'confirm',
    ),
    { type: 'give-incorrect-verdict' },
  )

  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'verdict',
        isRoundOrderRevealing: false,
        isSettingsOpen: false,
        isSettingsExitConfirmOpen: false,
        verdictFocusTarget: 'correct',
        isVerdictPickerOpen: false,
        verdictPickerStage: 'players',
        verdictPickerActionTarget: 'confirm',
        selectedGuessedPlayerIdx: null,
        guessedPlayerIndexes: [1, 3, 4],
        isReconnectBlocking: false,
        canToggleScoreRail: false,
        isVerdictWordVisible: false,
      },
      'confirm',
    ),
    { type: 'open-verdict-picker' },
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
        verdictPickerStage: 'players',
        verdictPickerActionTarget: 'confirm',
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
        verdictPickerStage: 'players',
        verdictPickerActionTarget: 'confirm',
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
        verdictPickerStage: 'players',
        verdictPickerActionTarget: 'confirm',
        selectedGuessedPlayerIdx: 3,
        guessedPlayerIndexes: [1, 3, 4],
        isReconnectBlocking: false,
        canToggleScoreRail: false,
        isVerdictWordVisible: false,
      },
      'confirm',
    ),
    { type: 'set-verdict-picker-stage', stage: 'actions' },
  )
})

run('moves between verdict players without leaving the grid', () => {
  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'verdict',
        isRoundOrderRevealing: false,
        isSettingsOpen: false,
        isSettingsExitConfirmOpen: false,
        isVerdictPickerOpen: true,
        verdictPickerStage: 'players',
        verdictPickerActionTarget: 'confirm',
        selectedGuessedPlayerIdx: 3,
        guessedPlayerIndexes: [1, 3, 4],
        isReconnectBlocking: false,
        canToggleScoreRail: false,
        isVerdictWordVisible: false,
      },
      'down',
    ),
    { type: 'select-verdict-player', playerIdx: 3 },
  )

  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'verdict',
        isRoundOrderRevealing: false,
        isSettingsOpen: false,
        isSettingsExitConfirmOpen: false,
        isVerdictPickerOpen: true,
        verdictPickerStage: 'actions',
        verdictPickerActionTarget: 'cancel',
        selectedGuessedPlayerIdx: 4,
        guessedPlayerIndexes: [1, 3, 4],
        isReconnectBlocking: false,
        canToggleScoreRail: false,
        isVerdictWordVisible: false,
      },
      'left',
    ),
    null,
  )

  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'verdict',
        isRoundOrderRevealing: false,
        isSettingsOpen: false,
        isSettingsExitConfirmOpen: false,
        isVerdictPickerOpen: true,
        verdictPickerStage: 'actions',
        verdictPickerActionTarget: 'confirm',
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

  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'verdict',
        isRoundOrderRevealing: false,
        isSettingsOpen: false,
        isSettingsExitConfirmOpen: false,
        isVerdictPickerOpen: true,
        verdictPickerStage: 'actions',
        verdictPickerActionTarget: 'confirm',
        selectedGuessedPlayerIdx: 3,
        guessedPlayerIndexes: [1, 3, 4],
        isReconnectBlocking: false,
        canToggleScoreRail: false,
        isVerdictWordVisible: false,
      },
      'back',
    ),
    { type: 'set-verdict-picker-stage', stage: 'players' },
  )
})

run('moves through verdict players vertically in a grid', () => {
  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'verdict',
        isRoundOrderRevealing: false,
        isSettingsOpen: false,
        isSettingsExitConfirmOpen: false,
        isVerdictPickerOpen: true,
        verdictPickerStage: 'players',
        verdictPickerActionTarget: 'confirm',
        selectedGuessedPlayerIdx: 1,
        guessedPlayerIndexes: [1, 3, 4, 6, 7, 9],
        isReconnectBlocking: false,
        canToggleScoreRail: false,
        isVerdictWordVisible: false,
      },
      'down',
    ),
    { type: 'select-verdict-player', playerIdx: 6 },
  )

  assert.deepEqual(
    hostControlsModule.resolveHostControlCommand(
      {
        phase: 'verdict',
        isRoundOrderRevealing: false,
        isSettingsOpen: false,
        isSettingsExitConfirmOpen: false,
        isVerdictPickerOpen: true,
        verdictPickerStage: 'players',
        verdictPickerActionTarget: 'confirm',
        selectedGuessedPlayerIdx: 6,
        guessedPlayerIndexes: [1, 3, 4, 6, 7, 9],
        isReconnectBlocking: false,
        canToggleScoreRail: false,
        isVerdictWordVisible: false,
      },
      'up',
    ),
    { type: 'select-verdict-player', playerIdx: 1 },
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
      'confirm',
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
      'confirm',
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
      'confirm',
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

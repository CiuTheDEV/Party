const assert = require('node:assert/strict')
const path = require('node:path')

const outputDir = process.argv[2]

if (!outputDir) {
  throw new Error('Expected compiled charades navigation output directory as first argument.')
}

const menuProfileModule = require(path.resolve(process.cwd(), outputDir, 'navigation', 'charades-menu-navigation-profile.js'))
const settingsProfileModule = require(path.resolve(process.cwd(), outputDir, 'navigation', 'charades-settings-navigation-profile.js'))
const setupProfileModule = require(path.resolve(process.cwd(), outputDir, 'navigation', 'charades-setup-navigation-profile.js'))
const runtimeProfileModule = require(path.resolve(process.cwd(), outputDir, 'navigation', 'charades-runtime-navigation-profile.js'))
const targetsModule = require(path.resolve(process.cwd(), outputDir, 'navigation', 'charades-navigation-targets.js'))
const actionsModule = require(path.resolve(process.cwd(), outputDir, 'navigation', 'charades-navigation-actions.js'))

function run(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    console.error(`not ok - ${name}`)
    throw error
  }
}

run('menu enters on play-now CTA', () => {
  assert.deepEqual(menuProfileModule.charadesMenuNavigationProfile.getEntryTarget({ activeView: 'mode', railTargets: [] }), {
    zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.content,
    targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.menuPlayNow,
  })
})

run('menu left from content enters the rail and rail right returns to content', () => {
  assert.deepEqual(
    menuProfileModule.charadesMenuNavigationProfile.resolveAction({
      context: { activeView: 'mode', railTargets: [] },
      current: {
        zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.content,
        targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.menuPlayNow,
      },
      action: 'left',
    }),
    {
      type: 'move',
      zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.rail,
      targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.railMenuLink,
    },
  )

  assert.deepEqual(
    menuProfileModule.charadesMenuNavigationProfile.resolveAction({
      context: { activeView: 'settings', railTargets: [] },
      current: {
        zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.rail,
        targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.railSettingsLink,
      },
      action: 'right',
    }),
    {
      type: 'move',
      zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.content,
      targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.menuPlayNow,
    },
  )
})

run('settings controls enter on keyboard device and other tabs enter on first real target', () => {
  assert.deepEqual(
    settingsProfileModule.charadesSettingsNavigationProfile.getEntryTarget({
      activeCategoryId: 'controls',
      activeControlsDevice: 'keyboard',
      visibleBindingIds: [],
      isListeningBinding: false,
    }),
    {
      zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.device,
      targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.settingsKeyboardDevice,
    },
  )

  assert.deepEqual(
    settingsProfileModule.charadesSettingsNavigationProfile.getEntryTarget({
      activeCategoryId: 'general',
      activeControlsDevice: 'keyboard',
      visibleBindingIds: [],
      isListeningBinding: false,
    }),
    {
      zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.content,
      targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.settingsGeneralCard,
    },
  )

  assert.deepEqual(
    settingsProfileModule.charadesSettingsNavigationProfile.getEntryTarget({
      activeCategoryId: 'audio',
      activeControlsDevice: 'keyboard',
      visibleBindingIds: [],
      isListeningBinding: false,
    }),
    {
      zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.content,
      targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.settingsAudioCard,
    },
  )
})

run('settings shortcuts switch top categories unless a binding is listening', () => {
  assert.deepEqual(
    settingsProfileModule.charadesSettingsNavigationProfile.resolveAction({
      context: {
        activeCategoryId: 'audio',
        activeControlsDevice: 'keyboard',
        visibleBindingIds: ['keyboard-left'],
        isListeningBinding: false,
      },
      current: {
        zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.device,
        targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.settingsKeyboardDevice,
      },
      action: 'next',
    }),
    {
      type: 'delegate',
      commandId: `${actionsModule.CHARADES_NAVIGATION_COMMANDS.settingsSelectCategory}:controls`,
    },
  )

  assert.deepEqual(
    settingsProfileModule.charadesSettingsNavigationProfile.resolveAction({
      context: {
        activeCategoryId: 'audio',
        activeControlsDevice: 'keyboard',
        visibleBindingIds: ['keyboard-left'],
        isListeningBinding: true,
      },
      current: {
        zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.device,
        targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.settingsKeyboardDevice,
      },
      action: 'next',
    }),
    { type: 'stay' },
  )
})

run('setup delegates close and start commands', () => {
  assert.deepEqual(
    setupProfileModule.charadesSetupNavigationProfile.resolveAction({
      context: { canStart: true },
      current: {
        zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.dialog,
        targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.setupStart,
      },
      action: 'confirm',
    }),
    {
      type: 'delegate',
      commandId: actionsModule.CHARADES_NAVIGATION_COMMANDS.setupStart,
    },
  )

  assert.deepEqual(
    setupProfileModule.charadesSetupNavigationProfile.resolveAction({
      context: { canStart: true },
      current: {
        zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.dialog,
        targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.setupStart,
      },
      action: 'back',
    }),
    {
      type: 'delegate',
      commandId: actionsModule.CHARADES_NAVIGATION_COMMANDS.setupClose,
    },
  )
})

run('runtime opens pause modal and verdict confirm delegates correctly', () => {
  assert.deepEqual(
    runtimeProfileModule.charadesRuntimeNavigationProfile.resolveAction({
      context: {
        canOpenVerdictPicker: true,
        isPauseModalOpen: false,
        isVerdictPickerOpen: false,
      },
      current: {
        zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.runtime,
        targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.runtimePrimary,
      },
      action: 'menu',
    }),
    {
      type: 'open-modal',
      screenId: targetsModule.CHARADES_NAVIGATION_SCREENS.runtime,
      zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.runtimeSettings,
      targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.runtimePauseSound,
    },
  )

  assert.deepEqual(
    runtimeProfileModule.charadesRuntimeNavigationProfile.resolveAction({
      context: {
        canOpenVerdictPicker: true,
        isPauseModalOpen: false,
        isVerdictPickerOpen: true,
      },
      current: {
        zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.runtime,
        targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.runtimeVerdictIncorrect,
      },
      action: 'confirm',
    }),
    {
      type: 'delegate',
      commandId: actionsModule.CHARADES_NAVIGATION_COMMANDS.runtimeGiveIncorrectVerdict,
    },
  )
})

run('runtime verdict profile uses result choice first, then player and action steps', () => {
  assert.deepEqual(
    runtimeProfileModule.charadesRuntimeNavigationProfile.resolveAction({
      context: {
        canOpenVerdictPicker: true,
        isPauseModalOpen: false,
        isVerdictPickerOpen: false,
      },
      current: {
        zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.runtime,
        targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.runtimeVerdictCorrect,
      },
      action: 'right',
    }),
    {
      type: 'move',
      zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.runtime,
      targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.runtimeVerdictIncorrect,
    },
  )

  assert.deepEqual(
    runtimeProfileModule.charadesRuntimeNavigationProfile.resolveAction({
      context: {
        canOpenVerdictPicker: true,
        isPauseModalOpen: false,
        isVerdictPickerOpen: true,
      },
      current: {
        zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.verdictPicker,
        targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.runtimeVerdictFirstPlayer,
      },
      action: 'confirm',
    }),
    {
      type: 'move',
      zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.verdictPicker,
      targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.runtimeVerdictConfirm,
    },
  )

  assert.deepEqual(
    runtimeProfileModule.charadesRuntimeNavigationProfile.resolveAction({
      context: {
        canOpenVerdictPicker: true,
        isPauseModalOpen: false,
        isVerdictPickerOpen: true,
      },
      current: {
        zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.verdictPicker,
        targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.runtimeVerdictConfirm,
      },
      action: 'back',
    }),
    {
      type: 'move',
      zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.verdictPicker,
      targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.runtimeVerdictFirstPlayer,
    },
  )
})

run('runtime settings profile moves between pause targets and delegates contextually', () => {
  assert.deepEqual(
    runtimeProfileModule.charadesRuntimeNavigationProfile.resolveAction({
      context: {
        canOpenVerdictPicker: false,
        isPauseModalOpen: true,
        isSettingsExitConfirmOpen: false,
        isVerdictPickerOpen: false,
      },
      current: {
        zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.runtimeSettings,
        targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.runtimePauseSound,
      },
      action: 'down',
    }),
    {
      type: 'move',
      zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.runtimeSettings,
      targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.runtimePauseAnimations,
    },
  )

  assert.deepEqual(
    runtimeProfileModule.charadesRuntimeNavigationProfile.resolveAction({
      context: {
        canOpenVerdictPicker: false,
        isPauseModalOpen: true,
        isSettingsExitConfirmOpen: false,
        isVerdictPickerOpen: false,
      },
      current: {
        zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.runtimeSettings,
        targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.runtimePauseExit,
      },
      action: 'confirm',
    }),
    {
      type: 'delegate',
      commandId: actionsModule.CHARADES_NAVIGATION_COMMANDS.runtimeOpenSettingsExitConfirm,
    },
  )

  assert.deepEqual(
    runtimeProfileModule.charadesRuntimeNavigationProfile.resolveAction({
      context: {
        canOpenVerdictPicker: false,
        isPauseModalOpen: true,
        isSettingsExitConfirmOpen: false,
        isVerdictPickerOpen: false,
      },
      current: {
        zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.runtimeSettings,
        targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.runtimePauseSound,
      },
      action: 'confirm',
    }),
    {
      type: 'delegate',
      commandId: actionsModule.CHARADES_NAVIGATION_COMMANDS.runtimeToggleSettingsSound,
    },
  )

  assert.deepEqual(
    runtimeProfileModule.charadesRuntimeNavigationProfile.resolveAction({
      context: {
        canOpenVerdictPicker: false,
        isPauseModalOpen: true,
        isSettingsExitConfirmOpen: false,
        isVerdictPickerOpen: false,
      },
      current: {
        zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.runtimeSettings,
        targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.runtimePauseAnimations,
      },
      action: 'confirm',
    }),
    {
      type: 'delegate',
      commandId: actionsModule.CHARADES_NAVIGATION_COMMANDS.runtimeToggleSettingsAnimations,
    },
  )

  assert.deepEqual(
    runtimeProfileModule.charadesRuntimeNavigationProfile.resolveAction({
      context: {
        canOpenVerdictPicker: false,
        isPauseModalOpen: true,
        isSettingsExitConfirmOpen: false,
        isVerdictPickerOpen: false,
      },
      current: {
        zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.runtimeSettings,
        targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.runtimePauseContinue,
      },
      action: 'confirm',
    }),
    {
      type: 'delegate',
      commandId: actionsModule.CHARADES_NAVIGATION_COMMANDS.runtimeCloseSettings,
    },
  )
})

run('runtime settings exit confirm moves between stay and exit', () => {
  assert.deepEqual(
    runtimeProfileModule.charadesRuntimeNavigationProfile.resolveAction({
      context: {
        canOpenVerdictPicker: false,
        isPauseModalOpen: true,
        isSettingsExitConfirmOpen: true,
        isVerdictPickerOpen: false,
      },
      current: {
        zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.runtimeSettingsConfirm,
        targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.runtimePauseConfirmStay,
      },
      action: 'right',
    }),
    {
      type: 'move',
      zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.runtimeSettingsConfirm,
      targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.runtimePauseConfirmExit,
    },
  )

  assert.deepEqual(
    runtimeProfileModule.charadesRuntimeNavigationProfile.resolveAction({
      context: {
        canOpenVerdictPicker: false,
        isPauseModalOpen: true,
        isSettingsExitConfirmOpen: true,
        isVerdictPickerOpen: false,
      },
      current: {
        zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.runtimeSettingsConfirm,
        targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.runtimePauseConfirmStay,
      },
      action: 'confirm',
    }),
    {
      type: 'delegate',
      commandId: actionsModule.CHARADES_NAVIGATION_COMMANDS.runtimeCancelSettingsExitConfirm,
    },
  )

  assert.deepEqual(
    runtimeProfileModule.charadesRuntimeNavigationProfile.resolveAction({
      context: {
        canOpenVerdictPicker: false,
        isPauseModalOpen: true,
        isSettingsExitConfirmOpen: true,
        isVerdictPickerOpen: false,
      },
      current: {
        zoneId: targetsModule.CHARADES_NAVIGATION_ZONES.runtimeSettingsConfirm,
        targetId: targetsModule.CHARADES_NAVIGATION_TARGETS.runtimePauseConfirmExit,
      },
      action: 'confirm',
    }),
    {
      type: 'delegate',
      commandId: actionsModule.CHARADES_NAVIGATION_COMMANDS.runtimeExitToMenu,
    },
  )
})

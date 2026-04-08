export const CHARADES_NAVIGATION_COMMANDS = {
  menuOpenSetup: 'charades.menu.open-setup',
  menuOpenSettings: 'charades.menu.open-settings',
  menuSelectRailTarget: 'charades.menu.select-rail-target',
  settingsSelectCategory: 'charades.settings.select-category',
  settingsStartBindingListen: 'charades.settings.start-binding-listen',
  settingsResetBindings: 'charades.settings.reset-bindings',
  settingsSaveBindings: 'charades.settings.save-bindings',
  settingsExitToMenu: 'charades.settings.exit-to-menu',
  setupClose: 'charades.setup.close',
  setupStart: 'charades.setup.start',
  runtimeOpenSettings: 'charades.runtime.open-settings',
  runtimeCloseSettings: 'charades.runtime.close-settings',
  runtimeOpenSettingsExitConfirm: 'charades.runtime.open-settings-exit-confirm',
  runtimeCancelSettingsExitConfirm: 'charades.runtime.cancel-settings-exit-confirm',
  runtimeExitToMenu: 'charades.runtime.exit-to-menu',
  runtimeToggleSettingsSound: 'charades.runtime.toggle-settings-sound',
  runtimeToggleSettingsAnimations: 'charades.runtime.toggle-settings-animations',
  runtimePrimary: 'charades.runtime.primary',
  runtimeGiveIncorrectVerdict: 'charades.runtime.give-incorrect-verdict',
  runtimeOpenVerdictPicker: 'charades.runtime.open-verdict-picker',
  runtimeCloseVerdictPicker: 'charades.runtime.close-verdict-picker',
  runtimeConfirmVerdict: 'charades.runtime.confirm-verdict',
} as const

export type CharadesNavigationCommandId =
  typeof CHARADES_NAVIGATION_COMMANDS[keyof typeof CHARADES_NAVIGATION_COMMANDS]

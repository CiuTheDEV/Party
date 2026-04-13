export const CODENAMES_NAVIGATION_COMMANDS = {
  menuOpenSetup: 'codenames.menu.open-setup',
  menuOpenSettings: 'codenames.menu.open-settings',
  menuSelectRailTarget: 'codenames.menu.select-rail-target',
  settingsSelectCategory: 'codenames.settings.select-category',
  settingsStartBindingListen: 'codenames.settings.start-binding-listen',
  settingsResetBindings: 'codenames.settings.reset-bindings',
  settingsSaveBindings: 'codenames.settings.save-bindings',
  settingsExitToMenu: 'codenames.settings.exit-to-menu',
  setupClose: 'codenames.setup.close',
  setupStart: 'codenames.setup.start',
} as const

export type CodenamesNavigationCommandId =
  typeof CODENAMES_NAVIGATION_COMMANDS[keyof typeof CODENAMES_NAVIGATION_COMMANDS]

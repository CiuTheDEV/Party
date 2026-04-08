import type { HostControlAction } from '../runtime/play/host-controls'

export type MenuModeFocusId = 'play'
export type SettingsCategoryId = 'general' | 'audio' | 'controls'
export type ControlsDevice = 'keyboard' | 'controller'
export type SettingsFooterFocusId = 'reset' | 'save'
export type SettingsFocusArea = 'tabs' | 'device' | 'bindings' | 'footer'

export type MenuModeCommand =
  | { type: 'open-setup' }
  | { type: 'open-settings' }
  | { type: 'focus-rail' }

export type SettingsTabsCommand =
  | { type: 'select-category'; categoryId: SettingsCategoryId }
  | { type: 'focus-rail' }

const SETTINGS_CATEGORY_ORDER: SettingsCategoryId[] = ['general', 'audio', 'controls']
const CONTROLS_DEVICE_ORDER: ControlsDevice[] = ['keyboard', 'controller']

export function resolveMenuModeCommand(focusId: MenuModeFocusId, action: HostControlAction): MenuModeCommand | null {
  if (action === 'menu') {
    return { type: 'open-settings' }
  }

  if (action === 'left') {
    return { type: 'focus-rail' }
  }

  if (action === 'confirm' || action === 'primary') {
    return { type: 'open-setup' }
  }

  return null
}

export function getNextSettingsCategoryId(current: SettingsCategoryId, action: HostControlAction) {
  if (action !== 'left' && action !== 'right' && action !== 'up' && action !== 'down') {
    return current
  }

  return getNextInList(SETTINGS_CATEGORY_ORDER, current, action === 'left' || action === 'up' ? -1 : 1) ?? current
}

export function resolveSettingsTabsCommand(current: SettingsCategoryId, action: HostControlAction): SettingsTabsCommand | null {
  const currentIndex = SETTINGS_CATEGORY_ORDER.indexOf(current)

  if (action === 'left') {
    if (currentIndex <= 0) {
      return { type: 'focus-rail' }
    }

    const previousCategoryId = SETTINGS_CATEGORY_ORDER[currentIndex - 1] ?? current
    return previousCategoryId === current
      ? { type: 'focus-rail' }
      : { type: 'select-category', categoryId: previousCategoryId }
  }

  if (action === 'right') {
    if (currentIndex < 0 || currentIndex >= SETTINGS_CATEGORY_ORDER.length - 1) {
      return null
    }

    const nextCategoryId = SETTINGS_CATEGORY_ORDER[currentIndex + 1] ?? current
    return nextCategoryId === current ? null : { type: 'select-category', categoryId: nextCategoryId }
  }

  return null
}

export function getNextControlsDevice(current: ControlsDevice, action: HostControlAction) {
  if (action !== 'left' && action !== 'right') {
    return current
  }

  return getNextInList(CONTROLS_DEVICE_ORDER, current, action === 'left' ? -1 : 1) ?? current
}

export function getNextBindingFocusId(bindingIds: string[], current: string, action: HostControlAction) {
  if (bindingIds.length === 0 || (action !== 'up' && action !== 'down')) {
    return current
  }

  return getNextInList(bindingIds, current, action === 'up' ? -1 : 1) ?? current
}

export function getNextFooterFocusId(
  current: SettingsFooterFocusId,
  action: HostControlAction,
) {
  if (action !== 'left' && action !== 'right') {
    return current
  }

  const items: SettingsFooterFocusId[] = ['reset', 'save']

  return getNextInList(items, current, action === 'left' ? -1 : 1) ?? current
}

export function getNextSettingsFocusArea(
  current: SettingsFocusArea,
  action: HostControlAction,
  options: { isControlsView: boolean },
) {
  if (action !== 'up' && action !== 'down') {
    return current
  }

  const items: SettingsFocusArea[] = options.isControlsView
    ? ['tabs', 'device', 'bindings', 'footer']
    : ['tabs', 'footer']

  return getNextInList(items, current, action === 'up' ? -1 : 1) ?? current
}

export function getNextRailFocusHref(hrefs: string[], current: string, action: HostControlAction) {
  if (action !== 'up' && action !== 'down') {
    return current
  }

  return getNextInList(hrefs, current, action === 'up' ? -1 : 1) ?? current
}

function getNextInList<T extends string>(items: T[], current: T, direction: -1 | 1) {
  const currentIndex = items.indexOf(current)
  if (currentIndex < 0) {
    return items[0] ?? null
  }

  const nextIndex = (currentIndex + direction + items.length) % items.length
  return items[nextIndex] ?? null
}

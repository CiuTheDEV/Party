export type CodenamesMenuView = 'mode' | 'settings'

const CODENAMES_MENU_HREF = '/games/codenames'
const CODENAMES_SETTINGS_HREF = '/games/codenames/settings'

export function getCodenamesMenuActiveHref(view: CodenamesMenuView): string {
  return view === 'settings' ? CODENAMES_SETTINGS_HREF : CODENAMES_MENU_HREF
}

export function resolveCodenamesMenuViewFromHref(href: string): CodenamesMenuView | null {
  if (href === CODENAMES_MENU_HREF) return 'mode'
  if (href === CODENAMES_SETTINGS_HREF) return 'settings'
  return null
}

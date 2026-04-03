export type CharadesMenuView = 'mode' | 'settings'

const CHARADES_MENU_HREF = '/games/charades'
const CHARADES_SETTINGS_HREF = '/games/charades/settings'

export function getCharadesMenuActiveHref(view: CharadesMenuView): string {
  return view === 'settings' ? CHARADES_SETTINGS_HREF : CHARADES_MENU_HREF
}

export function resolveCharadesMenuViewFromHref(href: string): CharadesMenuView | null {
  if (href === CHARADES_MENU_HREF) {
    return 'mode'
  }

  if (href === CHARADES_SETTINGS_HREF) {
    return 'settings'
  }

  return null
}

import type { CharadesWordCategory } from './helpers'
import type { CharadesSelectedCategories } from './state'

export const CHARADES_CATEGORY_UNLOCK_ENTITLEMENT = 'charades_category_pack'
export const CHARADES_BASE_CATEGORY_ID = 'classic'

export function isCharadesCategoryUnlocked(categoryId: string, entitlements: string[]) {
  return categoryId === CHARADES_BASE_CATEGORY_ID || entitlements.includes(CHARADES_CATEGORY_UNLOCK_ENTITLEMENT)
}

export function getCharadesAccessibleCategories(
  categories: CharadesWordCategory[],
  entitlements: string[],
) {
  return categories.filter((category) => isCharadesCategoryUnlocked(category.id, entitlements))
}

export function sanitizeCharadesSelectedCategories(
  selected: CharadesSelectedCategories,
  categories: CharadesWordCategory[],
  entitlements: string[],
) {
  const accessibleIds = new Set(getCharadesAccessibleCategories(categories, entitlements).map((category) => category.id))
  const entries = Object.entries(selected).filter(([categoryId]) => accessibleIds.has(categoryId))

  if (entries.length === Object.keys(selected).length) {
    return selected
  }

  return Object.fromEntries(entries) as CharadesSelectedCategories
}

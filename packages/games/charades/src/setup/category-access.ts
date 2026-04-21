import type { CharadesWordCategory } from './helpers'
import type { CharadesSelectedCategories } from './state'

export const CHARADES_CATEGORY_UNLOCK_ENTITLEMENT = 'charades_category_pack'
export const CHARADES_BASE_CATEGORY_ID = 'classic'

export function isCharadesCategoryUnlocked(_categoryId: string, _entitlements: string[]) {
  return true
}

export function getCharadesAccessibleCategories(
  categories: CharadesWordCategory[],
  _entitlements: string[],
) {
  return categories
}

export function sanitizeCharadesSelectedCategories(
  selected: CharadesSelectedCategories,
  categories: CharadesWordCategory[],
  _entitlements: string[],
) {
  const categoryIds = new Set(categories.map((category) => category.id))
  const entries = Object.entries(selected).filter(([categoryId]) => categoryIds.has(categoryId))

  if (entries.length === Object.keys(selected).length) {
    return selected
  }

  return Object.fromEntries(entries) as CharadesSelectedCategories
}

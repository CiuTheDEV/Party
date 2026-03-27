'use client'

import type { GameSetupSectionComponentProps } from '@party/game-sdk'
import type { CharadesSetupHelpers } from '../helpers'
import type { CharadesSetupState } from '../state'
import { CategoryPicker } from '../components/CategoryPicker'

export function CategoriesSection({
  state,
  updateState,
  helpers,
}: GameSetupSectionComponentProps<CharadesSetupState, CharadesSetupHelpers>) {
  return (
    <CategoryPicker
      categories={helpers.categories}
      selected={state.selectedCategories}
      onChange={(selectedCategories) => updateState((current) => ({ ...current, selectedCategories }))}
    />
  )
}

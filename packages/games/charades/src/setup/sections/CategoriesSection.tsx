'use client'

import type { GameSetupSectionComponentProps } from '@party/game-sdk'
import {
  getRemainingUniqueWordCount,
  getTotalUniqueWordCount,
} from '../../runtime/hooks/word-history-helpers'
import { buildPromptPool } from '../../runtime/hooks/word-pool-helpers'
import { readCharadesWordHistory } from '../../runtime/shared/charades-storage'
import { CategoryPicker, openCharadesPoolManager } from '../components/CategoryPicker'
import type { CharadesSetupHelpers } from '../helpers'
import type { CharadesSetupState } from '../state'
import styles from './CategoriesSection.module.css'

export function CategoriesSection({
  state,
  updateState,
  helpers,
}: GameSetupSectionComponentProps<CharadesSetupState, CharadesSetupHelpers>) {
  const prompts = buildPromptPool(helpers.categories, state.selectedCategories)
  const usedPromptKeys = new Set(readCharadesWordHistory()?.usedPrompts ?? [])
  const remaining = getRemainingUniqueWordCount(prompts, usedPromptKeys)
  const total = getTotalUniqueWordCount(prompts)
  const demand = state.players.length * state.settings.rounds
  const isPoolLow = (remaining > 0 && remaining < demand) || (total > 0 && total < demand)

  return (
    <div className={styles.section}>
      <CategoryPicker
        categories={helpers.categories}
        selected={state.selectedCategories}
        onChange={(selectedCategories) => updateState((current) => ({ ...current, selectedCategories }))}
      />

      {isPoolLow ? (
        <div className={styles.inlineWarning}>
          <div className={styles.inlineWarningCopy}>
            <span className={styles.inlineWarningEyebrow}>Niski stan puli</span>
            <p className={styles.inlineWarningText}>
              Zostało {remaining}/{total} unikalnych haseł, a ta konfiguracja może potrzebować około {demand}. W trakcie
              gry pula może się zresetować i hasła wrócą do użycia.
            </p>
          </div>
          <button
            type="button"
            className={styles.inlineWarningButton}
            onClick={() => openCharadesPoolManager()}
          >
            Zarządzaj pulą unikalnych haseł
          </button>
        </div>
      ) : null}
    </div>
  )
}

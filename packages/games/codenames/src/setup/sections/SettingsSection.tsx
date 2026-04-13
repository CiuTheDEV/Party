'use client'

import { useState } from 'react'
import type { GameSetupSectionComponentProps } from '@party/game-sdk'
import type { CodenamesSetupHelpers } from '../helpers'
import type { CodenamesSetupState } from '../state'
import { SettingsModal } from '../components/SettingsModal'
import { SettingsPanel } from '../components/SettingsPanel'
import styles from './SettingsSection.module.css'

export function SettingsSection({
  state,
  updateState,
  helpers,
}: GameSetupSectionComponentProps<CodenamesSetupState, CodenamesSetupHelpers>) {
  const [showModal, setShowModal] = useState(false)
  const selectedCategoriesCount = Object.keys(state.selectedCategories).length
  const selectedCategoryNames = helpers.categories
    .filter((category) => state.selectedCategories[category.id])
    .map((category) => category.name)

  return (
    <>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Ustawienia trybu</h3>
        <SettingsPanel
          rounds={state.settings.rounds}
          selectedCategoriesCount={selectedCategoriesCount}
          totalCategories={Math.max(helpers.categories.length, 1)}
          selectedCategoryNames={selectedCategoryNames}
          onOpen={() => setShowModal(true)}
        />
      </section>

      {showModal ? (
        <SettingsModal
          rounds={state.settings.rounds}
          onChange={(rounds) => updateState((current) => ({ ...current, settings: { ...current.settings, rounds } }))}
          onClose={() => setShowModal(false)}
        />
      ) : null}
    </>
  )
}

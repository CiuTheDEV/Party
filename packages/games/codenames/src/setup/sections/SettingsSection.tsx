'use client'

import { useState } from 'react'
import type { GameSetupSectionComponentProps } from '@party/game-sdk'
import type { CodenamesSetupHelpers } from '../helpers'
import { getCodenamesAssassinCount, type CodenamesSetupState } from '../state'
import { SettingsModal } from '../components/SettingsModal'
import { SettingsPanel } from '../components/SettingsPanel'
import styles from './SettingsSection.module.css'

export function SettingsSection({
  state,
  updateState,
}: GameSetupSectionComponentProps<CodenamesSetupState, CodenamesSetupHelpers>) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Ustawienia trybu</h3>
        <SettingsPanel
          rounds={state.settings.rounds}
          assassinCount={getCodenamesAssassinCount(state.settings)}
          extraAssassinsEnabled={state.settings.assassins.enabled}
          onOpen={() => setShowModal(true)}
        />
      </section>

      {showModal ? (
        <SettingsModal
          settings={state.settings}
          onChange={(settings) => updateState((current) => ({ ...current, settings }))}
          onClose={() => setShowModal(false)}
        />
      ) : null}
    </>
  )
}

'use client'

import { useState } from 'react'
import type { GameSetupSectionComponentProps } from '@party/game-sdk'
import type { CharadesSetupHelpers } from '../helpers'
import type { CharadesSetupState } from '../state'
import { SettingsPanel } from '../components/SettingsPanel'
import { SettingsModal } from '../components/SettingsModal'
import styles from './SettingsSection.module.css'

export function SettingsSection({ state, updateState }: GameSetupSectionComponentProps<CharadesSetupState, CharadesSetupHelpers>) {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Ustawienia trybu</h3>
        <SettingsPanel settings={state.settings} onOpen={() => setShowSettings(true)} />
      </section>
      {showSettings ? (
        <SettingsModal
          settings={state.settings}
          onChange={(settings) => updateState((current) => ({ ...current, settings }))}
          onClose={() => setShowSettings(false)}
        />
      ) : null}
    </>
  )
}

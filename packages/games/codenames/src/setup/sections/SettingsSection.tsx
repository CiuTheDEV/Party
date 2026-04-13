'use client'

import { useState } from 'react'
import type { GameSetupSectionComponentProps } from '@party/game-sdk'
import type { CodenamesSetupHelpers } from '../helpers'
import type { CodenamesSetupState } from '../state'
import styles from './SettingsSection.module.css'

const MIN_ROUNDS = 1
const MAX_ROUNDS = 10

export function SettingsSection({ state, updateState }: GameSetupSectionComponentProps<CodenamesSetupState, CodenamesSetupHelpers>) {
  const [showModal, setShowModal] = useState(false)
  const { rounds } = state.settings

  function setRounds(next: number) {
    const clamped = Math.max(MIN_ROUNDS, Math.min(MAX_ROUNDS, next))
    updateState((current) => ({ ...current, settings: { ...current.settings, rounds: clamped } }))
  }

  return (
    <>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Ustawienia trybu</h3>
        <button type="button" className={styles.settingsBtn} onClick={() => setShowModal(true)}>
          {'\u2699'} Ustawienia trybu
        </button>
        <div className={styles.settingsTiles}>
          <div className={styles.settingsTile}>
            <span className={styles.settingsTileLabel}>Rundy</span>
            <span className={styles.settingsTileValue}>{rounds}</span>
          </div>
        </div>
      </section>

      {showModal ? (
        <div className={styles.modalBackdrop} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Ustawienia trybu</h2>
              <button type="button" className={styles.modalClose} onClick={() => setShowModal(false)}>
                {'\u2715'}
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.settingRow}>
                <label className={styles.settingLabel}>Liczba rund</label>
                <div className={styles.stepper}>
                  <button
                    type="button"
                    className={styles.stepperBtn}
                    onClick={() => setRounds(rounds - 1)}
                    disabled={rounds <= MIN_ROUNDS}
                  >
                    {'\u2212'}
                  </button>
                  <span className={styles.stepperValue}>{rounds}</span>
                  <button
                    type="button"
                    className={styles.stepperBtn}
                    onClick={() => setRounds(rounds + 1)}
                    disabled={rounds >= MAX_ROUNDS}
                  >
                    {'+'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

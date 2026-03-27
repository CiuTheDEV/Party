'use client'

import { useState } from 'react'
import type { CharadesGameSettings } from '../state'
import styles from './SettingsModal.module.css'

type Props = {
  settings: CharadesGameSettings
  onChange: (settings: CharadesGameSettings) => void
  onClose: () => void
}

const TIMER_OPTIONS = [15, 30, 45, 60, 75, 90, 120]
const ROUNDS_OPTIONS = [1, 2, 3, 4, 5, 6, 7]

export function SettingsModal({ settings, onChange, onClose }: Props) {
  const [local, setLocal] = useState<CharadesGameSettings>(settings)

  function handleApply() {
    onChange(local)
    onClose()
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Ustawienia trybu</h2>

        <div className={styles.body}>
          <nav className={styles.sidebar}>
            <div className={`${styles.sidebarItem} ${styles.sidebarActive}`}>
              <span>{'\uD83C\uDFAE'}</span> Rozgrywka
            </div>
          </nav>

          <div className={styles.content}>
            <div className={styles.optionCard}>
              <div className={styles.optionHeader}>
                <span className={styles.optionLabel}>CZAS TURY</span>
                <span className={styles.optionValue}>{local.timerSeconds}s</span>
              </div>
              <input
                type="range"
                className={styles.slider}
                min={15}
                max={120}
                step={15}
                value={local.timerSeconds}
                onChange={(event) => setLocal({ ...local, timerSeconds: Number(event.target.value) })}
              />
              <div className={styles.quickButtons}>
                {TIMER_OPTIONS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.quickBtn} ${local.timerSeconds === value ? styles.quickBtnActive : ''}`}
                    onClick={() => setLocal({ ...local, timerSeconds: value })}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.optionCard}>
              <div className={styles.optionHeader}>
                <span className={styles.optionLabel}>LICZBA RUND</span>
                <span className={styles.optionValue}>{local.rounds}</span>
              </div>
              <input
                type="range"
                className={styles.slider}
                min={1}
                max={7}
                step={1}
                value={local.rounds}
                onChange={(event) => setLocal({ ...local, rounds: Number(event.target.value) })}
              />
              <div className={styles.quickButtons}>
                {ROUNDS_OPTIONS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.quickBtn} ${local.rounds === value ? styles.quickBtnActive : ''}`}
                    onClick={() => setLocal({ ...local, rounds: value })}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Anuluj
          </button>
          <button type="button" className={styles.applyBtn} onClick={handleApply}>
            Zastosuj
          </button>
        </div>
      </div>
    </div>
  )
}

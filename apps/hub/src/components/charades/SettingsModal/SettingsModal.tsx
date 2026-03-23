'use client'

import { useState } from 'react'
import type { GameSettings } from '../../../hooks/charades/useGameState'
import styles from './SettingsModal.module.css'

type Props = {
  settings: GameSettings
  onChange: (s: GameSettings) => void
  onClose: () => void
}

const TIMER_OPTIONS = [15, 30, 45, 60, 75, 90, 120]
const ROUNDS_OPTIONS = [1, 2, 3, 4, 5, 6, 7]

export function SettingsModal({ settings, onChange, onClose }: Props) {
  const [local, setLocal] = useState<GameSettings>(settings)

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
              <span>🎮</span> Rozgrywka
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
                onChange={(e) => setLocal({ ...local, timerSeconds: Number(e.target.value) })}
              />
              <div className={styles.quickButtons}>
                {TIMER_OPTIONS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`${styles.quickBtn} ${local.timerSeconds === v ? styles.quickBtnActive : ''}`}
                    onClick={() => setLocal({ ...local, timerSeconds: v })}
                  >
                    {v}
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
                onChange={(e) => setLocal({ ...local, rounds: Number(e.target.value) })}
              />
              <div className={styles.quickButtons}>
                {ROUNDS_OPTIONS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`${styles.quickBtn} ${local.rounds === v ? styles.quickBtnActive : ''}`}
                    onClick={() => setLocal({ ...local, rounds: v })}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Anuluj</button>
          <button className={styles.applyBtn} onClick={handleApply}>Zastosuj</button>
        </div>
      </div>
    </div>
  )
}

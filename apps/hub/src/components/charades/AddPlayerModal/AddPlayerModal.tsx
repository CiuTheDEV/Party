'use client'

import { useState } from 'react'
import type { Player } from '../../../hooks/charades/useGameState'
import styles from './AddPlayerModal.module.css'

const AVATAR_CATEGORIES = {
  Ludzie: ['😀', '😎', '🤩', '😍', '🥳', '😏', '🤓', '😜', '🧐', '😇', '🤠', '👻'],
  Zwierzęta: ['🐶', '🐱', '🐻', '🦊', '🐯', '🦁', '🐸', '🐼', '🐨', '🦄', '🐺', '🦝'],
  Inne: ['🎭', '🎪', '🎨', '🎬', '🎤', '🎸', '🎯', '🎲', '🏆', '⭐', '🔥', '💎'],
} as const

type Category = keyof typeof AVATAR_CATEGORIES

type Props = {
  onAdd: (player: Omit<Player, 'score'>) => void
  onClose: () => void
  existingPlayers: Omit<Player, 'score'>[]
}

export function AddPlayerModal({ onAdd, onClose, existingPlayers }: Props) {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [gender, setGender] = useState<Player['gender']>('none')
  const [category, setCategory] = useState<Category>('Ludzie')
  const [attempted, setAttempted] = useState(false)

  const nameTooShort = name.trim().length > 0 && name.trim().length < 3
  const nameTaken = name.trim().length >= 3 && existingPlayers.some(p => p.name.toLowerCase() === name.trim().toLowerCase())
  const nameValid = name.trim().length >= 3 && !nameTaken
  const avatarValid = avatar !== null && !existingPlayers.some(p => p.avatar === avatar)
  const genderValid = gender !== 'none'
  const canSubmit = nameValid && avatarValid && genderValid

  function handleSubmit() {
    if (!canSubmit) {
      setAttempted(true)
      return
    }
    onAdd({ name: name.trim(), avatar, gender })
    onClose()
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Dodaj gracza</h2>

        <div className={styles.body}>
          <div className={styles.left}>
            <p className={styles.label}>WYBRANY AVATAR</p>
            <div className={`${styles.avatarPreview} ${attempted && !avatarValid ? styles.fieldError : ''}`}>
              {avatar ? (
                <span className={styles.avatarEmoji}>{avatar}</span>
              ) : (
                <span className={styles.avatarPlaceholder}>?</span>
              )}
            </div>

            <label className={styles.label} htmlFor="player-name">Nazwa gracza</label>
            <input
              id="player-name"
              className={`${styles.input} ${attempted && !nameValid ? styles.fieldError : ''}`}
              type="text"
              placeholder="Nazwa gracza (min. 3 znaki)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              autoFocus
            />
            <p className={styles.inputHint}>
              {nameTaken ? 'Ta nazwa jest już zajęta' : nameTooShort ? 'Minimum 3 znaki' : ''}
            </p>

            <p className={styles.label}>Płeć</p>
            <div className={styles.genderRow}>
              <button
                type="button"
                data-gender="ona"
                className={`${styles.genderBtn} ${gender === 'ona' ? styles.selected : ''} ${attempted && !genderValid ? styles.fieldError : ''}`}
                onClick={() => setGender(gender === 'ona' ? 'none' : 'ona')}
              >
                ♀
              </button>
              <button
                type="button"
                data-gender="on"
                className={`${styles.genderBtn} ${gender === 'on' ? styles.selected : ''} ${attempted && !genderValid ? styles.fieldError : ''}`}
                onClick={() => setGender(gender === 'on' ? 'none' : 'on')}
              >
                ♂
              </button>
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.categoryTabs}>
              {(Object.keys(AVATAR_CATEGORIES) as Category[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`${styles.categoryTab} ${cat === category ? styles.activeTab : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className={styles.avatarGrid}>
              {AVATAR_CATEGORIES[category].map((a) => {
                const taken = existingPlayers.some(p => p.avatar === a)
                return (
                  <button
                    key={a}
                    type="button"
                    className={`${styles.avatarBtn} ${a === avatar ? styles.selectedAvatar : ''} ${taken ? styles.takenAvatar : ''}`}
                    onClick={() => !taken && setAvatar(a)}
                    disabled={taken}
                    aria-disabled={taken}
                  >
                    {a}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} type="button" onClick={onClose}>
            Anuluj
          </button>
          <button
            className={styles.submitBtn}
            type="button"
            data-ready={canSubmit ? 'true' : 'false'}
            onClick={handleSubmit}
          >
            Gotowe
          </button>
        </div>
      </div>
    </div>
  )
}

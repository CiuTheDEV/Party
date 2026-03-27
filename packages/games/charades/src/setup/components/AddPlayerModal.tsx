'use client'

import { useState } from 'react'
import type { CharadesPlayerDraft } from '../state'
import styles from './AddPlayerModal.module.css'

const AVATAR_CATEGORIES = {
  Ludzie: ['😀', '😎', '🤩', '😭', '🥳', '😺', '🤓', '😜', '🧐', '😇', '🤠', '👻'],
  Zwierzęta: ['🐶', '🐱', '🐻', '🦊', '🐯', '🦁', '🐸', '🐼', '🐨', '🦄', '🐺', '🦉'],
  Inne: ['🎭', '🎪', '🎨', '🎬', '🎤', '🎸', '🎯', '🎲', '🏆', '⭐', '🔥', '💎'],
} as const

type Category = keyof typeof AVATAR_CATEGORIES

type Props = {
  onAdd: (player: CharadesPlayerDraft) => void
  onClose: () => void
  existingPlayers: CharadesPlayerDraft[]
}

export function AddPlayerModal({ onAdd, onClose, existingPlayers }: Props) {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [gender, setGender] = useState<CharadesPlayerDraft['gender']>('none')
  const [category, setCategory] = useState<Category>('Ludzie')
  const [attempted, setAttempted] = useState(false)

  const nameTooShort = name.trim().length > 0 && name.trim().length < 3
  const nameTaken = name.trim().length >= 3 && existingPlayers.some((player) => player.name.toLowerCase() === name.trim().toLowerCase())
  const nameValid = name.trim().length >= 3 && !nameTaken
  const avatarValid = avatar !== null && !existingPlayers.some((player) => player.avatar === avatar)
  const genderValid = gender !== 'none'
  const canSubmit = nameValid && avatarValid && genderValid

  function handleSubmit() {
    if (!canSubmit || avatar === null) {
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
            <p className={styles.label}>Wybrany avatar</p>
            <div className={`${styles.avatarPreview} ${attempted && !avatarValid ? styles.fieldError : ''}`}>
              {avatar ? <span className={styles.avatarEmoji}>{avatar}</span> : <span className={styles.avatarPlaceholder}>?</span>}
            </div>

            <label className={styles.label} htmlFor="charades-player-name">Nazwa gracza</label>
            <input
              id="charades-player-name"
              className={`${styles.input} ${attempted && !nameValid ? styles.fieldError : ''}`}
              type="text"
              placeholder="Nazwa gracza (min. 3 znaki)"
              value={name}
              onChange={(event) => setName(event.target.value)}
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
              {(Object.keys(AVATAR_CATEGORIES) as Category[]).map((currentCategory) => (
                <button
                  key={currentCategory}
                  type="button"
                  className={`${styles.categoryTab} ${currentCategory === category ? styles.activeTab : ''}`}
                  onClick={() => setCategory(currentCategory)}
                >
                  {currentCategory}
                </button>
              ))}
            </div>
            <div className={styles.avatarGrid}>
              {AVATAR_CATEGORIES[category].map((currentAvatar) => {
                const taken = existingPlayers.some((player) => player.avatar === currentAvatar)
                return (
                  <button
                    key={currentAvatar}
                    type="button"
                    className={`${styles.avatarBtn} ${currentAvatar === avatar ? styles.selectedAvatar : ''} ${taken ? styles.takenAvatar : ''}`}
                    onClick={() => {
                      if (!taken) {
                        setAvatar(currentAvatar)
                      }
                    }}
                    disabled={taken}
                  >
                    {currentAvatar}
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
          <button className={styles.submitBtn} type="button" data-ready={canSubmit ? 'true' : 'false'} onClick={handleSubmit}>
            Gotowe
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import type { Player } from '../../../hooks/charades/useGameState'
import styles from './PlayerForm.module.css'

const AVATARS = ['🎭', '🎪', '🎨', '🎬', '🎤', '🎸', '🎯', '🎲', '🏆', '⭐', '🌟', '🔥']

type Props = {
  onAdd: (player: Omit<Player, 'score'>) => void
}

export function PlayerForm({ onAdd }: Props) {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [gender, setGender] = useState<Player['gender']>('none')
  const [open, setOpen] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ name: name.trim(), avatar, gender })
    setName('')
    setAvatar(AVATARS[0])
    setGender('none')
    setOpen(false)
  }

  if (!open) {
    return (
      <button className={styles.addBtn} onClick={() => setOpen(true)}>
        + Dodaj gracza
      </button>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        placeholder="Nazwa gracza"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        maxLength={20}
      />
      <div className={styles.avatarPicker}>
        {AVATARS.map((a) => (
          <button
            key={a}
            type="button"
            className={`${styles.avatarBtn} ${a === avatar ? styles.selected : ''}`}
            onClick={() => setAvatar(a)}
          >
            {a}
          </button>
        ))}
      </div>
      <div className={styles.genderRow}>
        {(['on', 'ona', 'none'] as const).map((g) => (
          <button
            key={g}
            type="button"
            className={`${styles.genderBtn} ${g === gender ? styles.selected : ''}`}
            onClick={() => setGender(g)}
          >
            {g === 'none' ? '—' : g}
          </button>
        ))}
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={() => setOpen(false)}>
          Anuluj
        </button>
        <button type="submit" className={styles.submitBtn} disabled={!name.trim()}>
          Dodaj
        </button>
      </div>
    </form>
  )
}

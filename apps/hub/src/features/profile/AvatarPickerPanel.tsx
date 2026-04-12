'use client'

import { useState } from 'react'
import { PARTY_AVATARS, getPartyAvatarAssetSrc } from '@party/ui'
import styles from './AvatarPickerPanel.module.css'

type AvatarPickerPanelProps = {
  currentAvatarId: string
  onAccept: (avatarId: string) => void
  onCancel: () => void
}

export function AvatarPickerPanel({ currentAvatarId, onAccept, onCancel }: AvatarPickerPanelProps) {
  const [pending, setPending] = useState(currentAvatarId)

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onCancel} aria-label="Wróć">
          ‹
        </button>
        <span className={styles.title}>Wybierz awatar</span>
      </div>

      <div className={styles.grid}>
        {PARTY_AVATARS.map((avatar) => (
          <button
            key={avatar.id}
            className={`${styles.avatarBtn} ${pending === avatar.id ? styles.selected : ''}`}
            onClick={() => setPending(avatar.id)}
            aria-label={avatar.label}
            title={avatar.label}
          >
            <img
              src={getPartyAvatarAssetSrc(avatar.id, 'static').src}
              alt={avatar.label}
              width={40}
              height={40}
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onCancel}>
          Anuluj
        </button>
        <button className={styles.acceptBtn} onClick={() => onAccept(pending)}>
          Akceptuj
        </button>
      </div>
    </div>
  )
}

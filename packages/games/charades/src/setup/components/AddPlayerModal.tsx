'use client'

import { AvatarAsset, getPartyAvatarCategories, getPartyAvatarsByCategory } from '@party/ui'
import { Sparkles, UserRound, Venus, Mars } from 'lucide-react'
import { useState } from 'react'
import type { PartyAvatarCategory } from '@party/ui'
import type { CharadesPlayerDraft } from '../state'
import styles from './AddPlayerModal.module.css'

type Props = {
  onAdd: (player: CharadesPlayerDraft) => void
  onClose: () => void
  existingPlayers: CharadesPlayerDraft[]
}

const AVATAR_CATEGORIES = getPartyAvatarCategories()

export function AddPlayerModal({ onAdd, onClose, existingPlayers }: Props) {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [gender, setGender] = useState<CharadesPlayerDraft['gender']>('none')
  const [category, setCategory] = useState<PartyAvatarCategory>('people')
  const [attempted, setAttempted] = useState(false)
  const avatars = getPartyAvatarsByCategory(category)

  const nameTooShort = name.trim().length > 0 && name.trim().length < 3
  const nameTaken =
    name.trim().length >= 3 &&
    existingPlayers.some((player) => player.name.toLowerCase() === name.trim().toLowerCase())
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
        <div className={styles.header}>
          <div className={styles.headerCopy}>
            <span className={styles.eyebrow}>Nowy gracz</span>
            <h2 className={styles.title}>Dodaj gracza</h2>
            <p className={styles.description}>Ustaw nazwę, awatar i płeć, żeby dołączyć nową osobę do rundy.</p>
          </div>
          <div className={styles.previewChip}>
            <UserRound size={16} />
            <span>{existingPlayers.length + 1}. slot</span>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.left}>
            <div className={styles.fieldCard}>
              <div className={styles.fieldHeader}>
                <span className={styles.label}>Wybrany avatar</span>
              </div>
              <div className={`${styles.avatarPreview} ${attempted && !avatarValid ? styles.fieldError : ''}`}>
                {avatar ? (
                  <AvatarAsset avatar={avatar} variant="animated" className={styles.avatarEmoji} />
                ) : (
                  <span className={styles.avatarPlaceholder}>?</span>
                )}
              </div>
            </div>

            <div className={styles.fieldCard}>
              <label className={styles.label} htmlFor="charades-player-name">
                Nazwa gracza
              </label>
              <input
                id="charades-player-name"
                className={`${styles.input} ${attempted && !nameValid ? styles.fieldError : ''}`}
                type="text"
                placeholder="Np. Ola"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={20}
                autoFocus
              />
              <p className={styles.inputHint}>
                {nameTaken ? 'Ta nazwa jest już zajęta.' : nameTooShort ? 'Minimum 3 znaki.' : ' '}
              </p>
            </div>

            <div className={styles.fieldCard}>
              <span className={styles.label}>Płeć</span>
              <div className={styles.genderRow}>
                <button
                  type="button"
                  data-gender="ona"
                  className={`${styles.genderBtn} ${gender === 'ona' ? styles.selected : ''} ${attempted && !genderValid ? styles.fieldError : ''}`}
                  onClick={() => setGender(gender === 'ona' ? 'none' : 'ona')}
                >
                  <Venus size={18} />
                  Ona
                </button>
                <button
                  type="button"
                  data-gender="on"
                  className={`${styles.genderBtn} ${gender === 'on' ? styles.selected : ''} ${attempted && !genderValid ? styles.fieldError : ''}`}
                  onClick={() => setGender(gender === 'on' ? 'none' : 'on')}
                >
                  <Mars size={18} />
                  On
                </button>
              </div>
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.avatarPanel}>
              <div className={styles.avatarPanelHeader}>
                <span className={styles.label}>Wybierz awatar</span>
                <span className={styles.avatarPanelMeta}>
                  <Sparkles size={14} />
                  Niedostępne są zajęte
                </span>
              </div>

              <div className={styles.categoryTabs}>
                {AVATAR_CATEGORIES.map((currentCategory) => (
                  <button
                    key={currentCategory.id}
                    type="button"
                    className={`${styles.categoryTab} ${currentCategory.id === category ? styles.activeTab : ''}`}
                    onClick={() => setCategory(currentCategory.id)}
                  >
                    {currentCategory.label}
                  </button>
                ))}
              </div>

              <div className={styles.avatarGrid}>
                {avatars.map((currentAvatar) => {
                  const taken = existingPlayers.some((player) => player.avatar === currentAvatar.id)

                  return (
                    <button
                      key={currentAvatar.id}
                      type="button"
                      className={`${styles.avatarBtn} ${currentAvatar.id === avatar ? styles.selectedAvatar : ''} ${taken ? styles.takenAvatar : ''}`}
                      onClick={() => {
                        if (!taken) {
                          setAvatar(currentAvatar.id)
                        }
                      }}
                      disabled={taken}
                      title={currentAvatar.label}
                    >
                      <AvatarAsset avatar={currentAvatar.id} className={styles.avatarBtnAsset} />
                    </button>
                  )
                })}
              </div>
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
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            Gotowe
          </button>
        </div>
      </div>
    </div>
  )
}

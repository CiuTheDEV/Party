'use client'

import { useEffect, useRef, useState } from 'react'
import { AvatarAsset, getPartyAvatarCategories, getPartyAvatarsByCategory } from '@party/ui'
import type { GameSetupSectionComponentProps } from '@party/game-sdk'
import { X } from 'lucide-react'
import type { CodenamesSetupHelpers } from '../helpers'
import type { CodenamesSetupState, CodenamesTeam } from '../state'
import styles from './TeamsSection.module.css'

const TEAM_COLORS = ['#dc2626', '#2563eb'] as const
const TEAM_LABELS = ['Drużyna Czerwonych', 'Drużyna Niebieskich'] as const

const ALL_AVATARS = [
  ...getPartyAvatarsByCategory('people'),
  ...getPartyAvatarsByCategory('animals'),
  ...getPartyAvatarsByCategory('other'),
].map((avatar) => avatar.id)

const AVATAR_CATEGORIES = getPartyAvatarCategories()

type AvatarCategoryId = (typeof AVATAR_CATEGORIES)[number]['id']

type TeamCardProps = {
  team: CodenamesTeam
  label: string
  color: string
  onChange: (team: CodenamesTeam) => void
}

function TeamCard({ team, label, color, onChange }: TeamCardProps) {
  const [pickingAvatar, setPickingAvatar] = useState(false)
  const [activeCategory, setActiveCategory] = useState<AvatarCategoryId>(AVATAR_CATEGORIES[0]?.id ?? 'people')
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pickingAvatar) {
      return
    }

    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setPickingAvatar(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [pickingAvatar])

  useEffect(() => {
    if (!pickingAvatar) {
      return
    }

    const match = AVATAR_CATEGORIES.find((category) =>
      getPartyAvatarsByCategory(category.id).some((avatar) => avatar.id === team.avatar),
    )

    if (match) {
      setActiveCategory(match.id)
    }
  }, [pickingAvatar, team.avatar])

  const activeAvatars = getPartyAvatarsByCategory(activeCategory)

  return (
    <div className={styles.card} style={{ '--team-color': color } as React.CSSProperties}>
      <div className={styles.cardHeader}>
        <span className={styles.cardLabel}>{label}</span>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.avatarPopupAnchor} ref={popupRef}>
          <button
            type="button"
            className={styles.avatarBtn}
            onClick={() => setPickingAvatar((prev) => !prev)}
            title="Zmień avatar drużyny"
          >
            <span className={styles.avatarFrame}>
              <AvatarAsset avatar={team.avatar} size={84} />
            </span>
            <span className={styles.avatarHint}>Zmień avatar</span>
          </button>

          {pickingAvatar ? (
            <div className={styles.avatarPopup}>
              <div className={styles.avatarPopupHeader}>
                    <span className={styles.avatarPopupTitle}>Wybierz awatar</span>
                <button type="button" className={styles.avatarPopupClose} onClick={() => setPickingAvatar(false)}>
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>

              <div
                className={styles.avatarTabs}
                style={{ gridTemplateColumns: `repeat(${AVATAR_CATEGORIES.length}, minmax(0, 1fr))` }}
              >
                {AVATAR_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={category.id === activeCategory ? `${styles.avatarTab} ${styles.avatarTabActive}` : styles.avatarTab}
                    onClick={() => setActiveCategory(category.id as AvatarCategoryId)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              <div className={styles.avatarGrid}>
                {activeAvatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    className={team.avatar === avatar.id ? `${styles.avatarOption} ${styles.avatarOptionActive}` : styles.avatarOption}
                    onClick={() => {
                      onChange({ ...team, avatar: avatar.id })
                      setPickingAvatar(false)
                    }}
                    aria-label={avatar.label}
                    title={avatar.label}
                  >
                    <span className={styles.avatarOptionFrame}>
                      <AvatarAsset avatar={avatar.id} size={42} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className={styles.nameBlock}>
          <span className={styles.nameLabel}>Nazwa drużyny</span>
          <input
            className={styles.nameInput}
            type="text"
            value={team.name}
            maxLength={20}
            onChange={(event) => onChange({ ...team, name: event.target.value })}
            placeholder="Nazwa drużyny"
          />
        </div>
      </div>
    </div>
  )
}

export function TeamsSection({ state, updateState }: GameSetupSectionComponentProps<CodenamesSetupState, CodenamesSetupHelpers>) {
  function updateTeam(index: 0 | 1, team: CodenamesTeam) {
    updateState((current) => {
      const next: [CodenamesTeam, CodenamesTeam] = [current.teams[0], current.teams[1]]
      next[index] = team
      return { ...current, teams: next }
    })
  }

  return (
    <section className={styles.section}>
      <div className={styles.teamsGrid}>
        <TeamCard
          team={state.teams[0]}
          label={TEAM_LABELS[0]}
          color={TEAM_COLORS[0]}
          onChange={(team) => updateTeam(0, team)}
        />
        <TeamCard
          team={state.teams[1]}
          label={TEAM_LABELS[1]}
          color={TEAM_COLORS[1]}
          onChange={(team) => updateTeam(1, team)}
        />
      </div>
    </section>
  )
}

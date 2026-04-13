'use client'

import { useState, useEffect, useRef } from 'react'
import { getPartyAvatarsByCategory, AvatarAsset } from '@party/ui'
import type { GameSetupSectionComponentProps } from '@party/game-sdk'
import type { CodenamesSetupHelpers } from '../helpers'
import type { CodenamesSetupState, CodenamesTeam } from '../state'
import styles from './TeamsSection.module.css'

const TEAM_COLORS = ['#dc2626', '#2563eb'] as const
const TEAM_LABELS = ['Drużyna Czerwonych', 'Drużyna Niebieskich'] as const

const ALL_AVATARS = [
  ...getPartyAvatarsByCategory('people'),
  ...getPartyAvatarsByCategory('animals'),
  ...getPartyAvatarsByCategory('other'),
].map((a) => a.id)

type TeamCardProps = {
  team: CodenamesTeam
  label: string
  color: string
  onChange: (team: CodenamesTeam) => void
}

function TeamCard({ team, label, color, onChange }: TeamCardProps) {
  const [pickingAvatar, setPickingAvatar] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pickingAvatar) return
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPickingAvatar(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [pickingAvatar])

  return (
    <div className={styles.card} style={{ '--team-color': color } as React.CSSProperties}>
      <div className={styles.cardHeader}>
        <span className={styles.cardLabel}>{label}</span>
      </div>
      <div className={styles.avatarPopupAnchor} ref={popupRef}>
        <button
          type="button"
          className={styles.avatarBtn}
          onClick={() => setPickingAvatar((prev) => !prev)}
          title="Zmień avatar drużyny"
        >
          <AvatarAsset avatar={team.avatar} />
          <span className={styles.avatarHint}>Zmień</span>
        </button>
        {pickingAvatar ? (
          <div className={styles.avatarPopup}>
            <div className={styles.avatarGrid}>
              {ALL_AVATARS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={team.avatar === id ? `${styles.avatarOption} ${styles.avatarOptionActive}` : styles.avatarOption}
                  onClick={() => {
                    onChange({ ...team, avatar: id })
                    setPickingAvatar(false)
                  }}
                >
                  <AvatarAsset avatar={id} />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <input
        className={styles.nameInput}
        type="text"
        value={team.name}
        maxLength={20}
        onChange={(e) => onChange({ ...team, name: e.target.value })}
        placeholder="Nazwa drużyny"
      />
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
      <h3 className={styles.sectionTitle}>Drużyny</h3>
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

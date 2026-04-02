'use client'

import { getPartyAvatarsByCategory } from '@party/ui'
import { useState } from 'react'
import type { GameSetupSectionComponentProps } from '@party/game-sdk'
import type { CharadesSetupHelpers } from '../helpers'
import type { CharadesSetupState } from '../state'
import { AddPlayerModal } from '../components/AddPlayerModal'
import { PlayerGrid } from '../components/PlayerGrid'
import styles from './PlayersSection.module.css'

const TEST_PLAYER_NAMES = ['Antek', 'Basia', 'Celina', 'Dawid', 'Eryk', 'Felka', 'Gabi', 'Hubert', 'Iga', 'Julka', 'Kacper', 'Lena']
const TEST_AVATARS = [
  ...getPartyAvatarsByCategory('people'),
  ...getPartyAvatarsByCategory('animals'),
  ...getPartyAvatarsByCategory('other'),
].map((avatar) => avatar.id)

export function PlayersSection({ state, updateState }: GameSetupSectionComponentProps<CharadesSetupState, CharadesSetupHelpers>) {
  const [showAddPlayer, setShowAddPlayer] = useState(false)

  function addRandomPlayer() {
    updateState((current) => {
      if (current.players.length >= 12) {
        return current
      }

      const usedNames = new Set(current.players.map((player) => player.name.toLowerCase()))
      const usedAvatars = new Set(current.players.map((player) => player.avatar))
      const availableName =
        TEST_PLAYER_NAMES.find((name) => !usedNames.has(name.toLowerCase())) ?? `Gracz ${current.players.length + 1}`
      const availableAvatar = TEST_AVATARS.find((avatar) => !usedAvatars.has(avatar)) ?? 'smile'
      const gender = Math.random() > 0.5 ? 'on' : 'ona'

      return {
        ...current,
        players: [...current.players, { name: availableName, avatar: availableAvatar, gender }],
      }
    })
  }

  return (
    <>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Gracze</h3>
          <div className={styles.sectionMeta}>
            <button
              type="button"
              className={styles.testAddButton}
              onClick={addRandomPlayer}
              disabled={state.players.length >= 12}
            >
              Szybki test
            </button>
            <span className={styles.sectionCount}>{state.players.length}/12</span>
          </div>
        </div>

        <PlayerGrid
          players={state.players}
          onRemove={(index) => updateState((current) => ({ ...current, players: current.players.filter((_, i) => i !== index) }))}
          onAdd={() => setShowAddPlayer(true)}
        />

        {state.players.length < 2 ? <p className={styles.hint}>Dodaj co najmniej 2 graczy, żeby rozpocząć rozgrywkę.</p> : null}
      </section>

      {showAddPlayer ? (
        <AddPlayerModal
          existingPlayers={state.players}
          onClose={() => setShowAddPlayer(false)}
          onAdd={(player) => updateState((current) => ({ ...current, players: [...current.players, player] }))}
        />
      ) : null}
    </>
  )
}

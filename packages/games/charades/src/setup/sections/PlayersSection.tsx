'use client'

import { getPartyAvatarsByCategory } from '@party/ui'
import { useState } from 'react'
import type { GameSetupSectionComponentProps } from '@party/game-sdk'
import type { CharadesSetupHelpers } from '../helpers'
import { CHARADES_MAX_PLAYERS, CHARADES_MIN_PLAYERS, type CharadesSetupState } from '../state'
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
  const [editingPlayerIndex, setEditingPlayerIndex] = useState<number | null>(null)

  function addRandomPlayer() {
    updateState((current) => {
      if (current.players.length >= CHARADES_MAX_PLAYERS) {
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
              disabled={state.players.length >= CHARADES_MAX_PLAYERS}
            >
              Szybki test
            </button>
            <span className={styles.sectionCount}>
              {state.players.length}/{CHARADES_MAX_PLAYERS}
            </span>
          </div>
        </div>

        <PlayerGrid
          players={state.players}
          onRemove={(index) => updateState((current) => ({ ...current, players: current.players.filter((_, i) => i !== index) }))}
          onEdit={(index) => setEditingPlayerIndex(index)}
          onAdd={() => setShowAddPlayer(true)}
        />

        {state.players.length < CHARADES_MIN_PLAYERS ? (
          <p className={styles.hint}>Dodaj co najmniej {CHARADES_MIN_PLAYERS} graczy, żeby rozpocząć rozgrywkę.</p>
        ) : null}
      </section>

      {showAddPlayer || editingPlayerIndex !== null ? (
        <AddPlayerModal
          existingPlayers={state.players}
          player={editingPlayerIndex !== null ? state.players[editingPlayerIndex] ?? null : null}
          playerIndex={editingPlayerIndex}
          onClose={() => {
            setShowAddPlayer(false)
            setEditingPlayerIndex(null)
          }}
          onSubmit={(player) =>
            updateState((current) => {
              if (editingPlayerIndex === null) {
                return { ...current, players: [...current.players, player] }
              }

              return {
                ...current,
                players: current.players.map((currentPlayer, index) => (index === editingPlayerIndex ? player : currentPlayer)),
              }
            })
          }
        />
      ) : null}
    </>
  )
}

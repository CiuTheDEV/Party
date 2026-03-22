'use client'

import { useState, useId } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { allCategories } from '@content/charades/index'
import { PlayerForm } from '../../../../components/charades/PlayerForm/PlayerForm'
import { PlayerList } from '../../../../components/charades/PlayerList/PlayerList'
import { CategoryPicker } from '../../../../components/charades/CategoryPicker/CategoryPicker'
import { SettingsModal } from '../../../../components/charades/SettingsModal/SettingsModal'
import { QRPairing } from '../../../../components/charades/QRPairing/QRPairing'
import type { Player, GameSettings } from '../../../../hooks/charades/useGameState'
import styles from './page.module.css'

const DeviceListener = dynamic(
  () => import('../../../../components/charades/DeviceListener'),
  { ssr: false },
)

export default function CharadesConfigPage() {
  const router = useRouter()
  const roomId = useId().replace(/:/g, '')

  const [players, setPlayers] = useState<Omit<Player, 'score'>[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [settings, setSettings] = useState<GameSettings>({ rounds: 3, timerSeconds: 60 })
  const [showSettings, setShowSettings] = useState(false)
  const [isDeviceConnected, setIsDeviceConnected] = useState(false)

  function addPlayer(p: Omit<Player, 'score'>) {
    setPlayers((prev) => [...prev, p])
  }

  function removePlayer(index: number) {
    setPlayers((prev) => prev.filter((_, i) => i !== index))
  }

  const canStart = players.length >= 2 && selectedCategories.length >= 1 && isDeviceConnected

  function handleStart() {
    if (!canStart) return
    sessionStorage.setItem(
      'charades:config',
      JSON.stringify({ players, selectedCategories, settings, roomId }),
    )
    router.push('/games/charades/play')
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Konfiguracja gry</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Gracze</h2>
        <PlayerList players={players} onRemove={removePlayer} />
        <PlayerForm onAdd={addPlayer} />
        {players.length < 2 && (
          <p className={styles.hint}>Dodaj co najmniej 2 graczy</p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Talia słów</h2>
        <CategoryPicker
          categories={allCategories}
          selected={selectedCategories}
          onChange={setSelectedCategories}
        />
        {selectedCategories.length === 0 && (
          <p className={styles.hint}>Wybierz co najmniej 1 kategorię</p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Urządzenie prezentera</h2>
        <QRPairing
          roomId={roomId}
          isConnected={isDeviceConnected}
          onDisconnect={() => setIsDeviceConnected(false)}
        />
        <DeviceListener roomId={roomId} onConnect={() => setIsDeviceConnected(true)} />
      </section>

      <div className={styles.footer}>
        <button className={styles.settingsBtn} onClick={() => setShowSettings(true)}>
          Ustawienia trybu
        </button>
        <button
          className={styles.startBtn}
          disabled={!canStart}
          onClick={handleStart}
        >
          Rozpocznij grę
        </button>
      </div>

      {showSettings && (
        <SettingsModal
          settings={settings}
          onChange={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </main>
  )
}

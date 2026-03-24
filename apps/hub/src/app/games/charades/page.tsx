'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Users, Smartphone, Target, Info } from 'lucide-react'
import { GameIcon } from '@party/ui'
import { allCategories } from '@content/charades/index'
import { PlayerGrid } from '../../../components/charades/PlayerGrid/PlayerGrid'
import { AddPlayerModal } from '../../../components/charades/AddPlayerModal/AddPlayerModal'
import { CategoryPicker, type SelectedCategories } from '../../../components/charades/CategoryPicker/CategoryPicker'
import { SettingsModal } from '../../../components/charades/SettingsModal/SettingsModal'
import { QRPairing } from '../../../components/charades/QRPairing/QRPairing'
import type { Player, GameSettings } from '../../../hooks/charades/useGameState'
import {
  clearPresenterSession,
  createCharadesRoomId,
  isPresenterSessionFresh,
  readCharadesSetup,
  readPresenterSession,
  writeCharadesSetup,
} from '../../../utils/charades-storage'
import styles from './page.module.css'

const TEST_PLAYER_NAMES = [
  'Antek',
  'Basia',
  'Celina',
  'Dawid',
  'Eryk',
  'Felka',
  'Gabi',
  'Hubert',
  'Iga',
  'Julka',
  'Kacper',
  'Lena',
  'Maks',
  'Nina',
  'Olek',
  'Pola',
  'Rafal',
  'Sara',
  'Tymon',
  'Wera',
] as const

const TEST_AVATARS = ['😀', '😎', '🤩', '🥳', '😺', '🐻', '🦊', '🐼', '🐸', '🦁', '🎭', '🎨'] as const

const DeviceListener = dynamic(
  () => import('../../../components/charades/DeviceListener'),
  { ssr: false },
)

export default function CharadesMenuPage() {
  const router = useRouter()

  const [showConfig, setShowConfig] = useState(false)
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [players, setPlayers] = useState<Omit<Player, 'score'>[]>([])
  const [selectedCategories, setSelectedCategories] = useState<SelectedCategories>({})
  const [settings, setSettings] = useState<GameSettings>({ rounds: 3, timerSeconds: 60 })
  const [showSettings, setShowSettings] = useState(false)
  const [isDeviceConnected, setIsDeviceConnected] = useState(false)
  const [startAttempted, setStartAttempted] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)
  const [roomId, setRoomId] = useState('')
  const [isSetupReady, setIsSetupReady] = useState(false)

  useEffect(() => {
    const storedSetup = readCharadesSetup()
    const nextRoomId = storedSetup?.roomId || createCharadesRoomId()

    setRoomId(nextRoomId)

    if (storedSetup) {
      setPlayers(storedSetup.players)
      setSelectedCategories(storedSetup.selectedCategories)
      setSettings(storedSetup.settings)
    }

    setIsDeviceConnected(isPresenterSessionFresh(readPresenterSession(), nextRoomId))
    setIsSetupReady(true)
  }, [])

  useEffect(() => {
    if (!isSetupReady || !roomId) {
      return
    }

    writeCharadesSetup({
      roomId,
      players,
      selectedCategories,
      settings,
    })
  }, [isSetupReady, players, roomId, selectedCategories, settings])

  function handleDisconnectDevice() {
    clearPresenterSession()
    setIsDeviceConnected(false)
    setRoomId(createCharadesRoomId())
  }

  function addPlayer(p: Omit<Player, 'score'>) {
    setPlayers((prev) => [...prev, p])
  }

  function removePlayer(index: number) {
    setPlayers((prev) => prev.filter((_, i) => i !== index))
  }

  function addRandomPlayer() {
    setPlayers((prev) => {
      if (prev.length >= 12) {
        return prev
      }

      const usedNames = new Set(prev.map((player) => player.name.toLowerCase()))
      const usedAvatars = new Set(prev.map((player) => player.avatar))

      const availableName = TEST_PLAYER_NAMES.find((name) => !usedNames.has(name.toLowerCase())) ?? `Gracz ${prev.length + 1}`
      const availableAvatar = TEST_AVATARS.find((avatar) => !usedAvatars.has(avatar)) ?? '🙂'
      const gender: Omit<Player, 'score'>['gender'] = Math.random() > 0.5 ? 'on' : 'ona'

      return [...prev, { name: availableName, avatar: availableAvatar, gender }]
    })
  }

  const canStart = players.length >= 2 && Object.keys(selectedCategories).length >= 1 && isDeviceConnected

  function handleStart() {
    if (!roomId) {
      return
    }

    if (!canStart) { setStartAttempted(true); setShakeKey((k) => k + 1); return }
    sessionStorage.setItem(
      'charades:config',
      JSON.stringify({ players, selectedCategories, settings, roomId }),
    )
    router.push('/games/charades/play')
  }


  return (
    <>
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.iconWrapper}>
            <div className={styles.iconGlow} />
            <GameIcon emoji="🎭" size="lg" />
          </div>
          <h1 className={styles.title}>Kalambury</h1>
          <p className={styles.subtitle}>
            Pokazuj hasła bez słów — tylko gestem i mimiką.<br />
            Sprawdź, czy Twoi znajomi Cię zrozumieją!
          </p>
        </section>

        <section className={styles.modeCard}>
          <div className={styles.modeHeader}>
            <h2 className={styles.modeName}>Tryb Klasyczny</h2>
            <span className={styles.badge}>ZALECANY</span>
          </div>
          <div className={styles.modeBody}>
            <p className={styles.modeDesc}>
              Każdy gracz prezentuje hasło po kolei. Gra do wybranej liczby rund.
              Potrzebujesz drugiego urządzenia dla prezentera.
            </p>
            <ul className={styles.details}>
              <li><span className={styles.iconPlayers}><Users size={18} aria-hidden="true" /></span>2–8 graczy</li>
              <li><span className={styles.iconPhone}><Smartphone size={18} aria-hidden="true" /></span>Jedno urządzenie dla prezentera (telefon)</li>
              <li><span className={styles.iconTarget}><Target size={18} aria-hidden="true" /></span>Wybierasz kategorie słów i liczbę rund</li>
            </ul>
          </div>
          <button className={styles.playBtn} onClick={() => setShowConfig(true)}>
            Zagraj Teraz ▶
          </button>
        </section>

        <footer className={styles.footer}>
          <div className={styles.footerLinks}>
            <span className={styles.footerLink}>Jak grać?</span>
            <span className={styles.footerLink}>Zasady</span>
            <span className={styles.footerLink}>Wsparcie</span>
          </div>
          <p className={styles.infoBar}>
            <Info size={13} aria-hidden="true" />
            Pamiętaj o bezpiecznej zabawie w grupie!
          </p>
        </footer>
      </main>

      {showConfig && (
        <div className={styles.configBackdrop}>
          <div className={styles.configModal}>
            <div className={styles.configHeader}>
              <div className={styles.configHeaderText}>
                <h2 className={styles.configTitle}>Kalambury</h2>
                <p className={styles.configSubtitle}>Konfiguracja meczu</p>
              </div>
              <button
                className={styles.configClose}
                onClick={() => setShowConfig(false)}
                aria-label="Zamknij"
              >
                ✕
              </button>
            </div>

            <div className={styles.configBody}>
              <section
                key={startAttempted && players.length < 2 ? `players-err-${shakeKey}` : 'players'}
                className={`${styles.configSection} ${startAttempted && players.length < 2 ? styles.configSectionError : ''}`}
              >
                <div className={styles.configSectionHeader}>
                  <h3 className={styles.configSectionTitle}>Gracze</h3>
                  <div className={styles.configSectionMeta}>
                    <button
                      type="button"
                      className={styles.configTestAddBtn}
                      onClick={addRandomPlayer}
                      disabled={players.length >= 12}
                    >
                      + test
                    </button>
                    <span className={styles.configSectionCount}>{players.length}/12</span>
                  </div>
                </div>
                <PlayerGrid
                  players={players}
                  onRemove={removePlayer}
                  onAdd={() => setShowAddPlayer(true)}
                />
                {players.length < 2 && (
                  <p className={styles.configHint}>Dodaj co najmniej 2 graczy</p>
                )}
              </section>

              <section className={styles.configSection}>
                <h3 className={styles.configSectionTitle}>Ustawienia trybu</h3>
                <button className={styles.settingsBtn} onClick={() => setShowSettings(true)}>
                  ⚙ Ustawienia trybu
                </button>
                <div className={styles.settingsTiles}>
                  <div className={styles.settingsTile}>
                    <span className={styles.settingsTileLabel}>Rundy</span>
                    <span className={styles.settingsTileValue}>{settings.rounds}</span>
                  </div>
                  <div className={styles.settingsTile}>
                    <span className={styles.settingsTileLabel}>Czas na hasło</span>
                    <span className={styles.settingsTileValue}>{settings.timerSeconds}s</span>
                  </div>
                </div>
              </section>

              <div
                key={startAttempted && Object.keys(selectedCategories).length === 0 ? `cats-err-${shakeKey}` : 'cats'}
                className={startAttempted && Object.keys(selectedCategories).length === 0 ? styles.configSectionError : ''}
              >
                <CategoryPicker
                  categories={allCategories}
                  selected={selectedCategories}
                  onChange={setSelectedCategories}
                />
              </div>

              <div
                key={startAttempted && !isDeviceConnected ? `device-err-${shakeKey}` : 'device'}
                className={startAttempted && !isDeviceConnected ? styles.configSectionError : ''}
              >
                <QRPairing
                  roomId={roomId}
                  isConnected={isDeviceConnected}
                  onDisconnect={handleDisconnectDevice}
                />
              </div>
              <DeviceListener
                roomId={roomId}
                onConnect={() => setIsDeviceConnected(true)}
                onDisconnect={() => setIsDeviceConnected(false)}
              />
            </div>

            <div className={styles.configFooter}>
              <button className={styles.configStartBtn} onClick={handleStart}>
                Rozpocznij grę
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddPlayer && (
        <AddPlayerModal
          onAdd={addPlayer}
          onClose={() => setShowAddPlayer(false)}
          existingPlayers={players}
        />
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          onChange={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  )
}

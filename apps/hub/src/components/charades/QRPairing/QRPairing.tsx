'use client'

import { QRCodeSVG } from 'qrcode.react'
import styles from './QRPairing.module.css'

type Props = {
  roomId: string
  isConnected: boolean
  onDisconnect: () => void
}

export function QRPairing({ roomId, isConnected, onDisconnect }: Props) {
  const presenterUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/games/charades/present?room=${roomId}`
    : ''

  if (isConnected) {
    return (
      <div className={styles.connected}>
        <span className={styles.icon}>📱</span>
        <span>Urządzenie połączone</span>
        <button className={styles.disconnectBtn} onClick={onDisconnect}>
          Rozłącz
        </button>
      </div>
    )
  }

  return (
    <div className={styles.qrWrapper}>
      <p className={styles.hint}>Zeskanuj QR kodem telefon prezentera</p>
      {presenterUrl && (
        <QRCodeSVG
          value={presenterUrl}
          size={180}
          bgColor="transparent"
          fgColor="#f0f0f0"
        />
      )}
      <p className={styles.url}>{presenterUrl}</p>
    </div>
  )
}

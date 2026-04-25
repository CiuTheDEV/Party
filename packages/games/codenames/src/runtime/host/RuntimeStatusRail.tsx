'use client'

import { AvatarAsset } from '@party/ui'
import type { RuntimeStatus } from '../shared/runtime-status'
import type { RoomState } from '../shared/codenames-events'
import styles from './RuntimeStatusRail.module.css'

type Team = { name: string; avatar: string }

type RuntimeStatusRailProps = {
  open: boolean
  roomId: string
  redTeam: Team
  blueTeam: Team
  roundsToWin: number
  roomState: RoomState
  status: RuntimeStatus | null
  railLabel: string | null
}

function getStartingTeamName(roomState: RoomState, redTeam: Team, blueTeam: Team) {
  if (roomState.startingTeam === 'red') {
    return redTeam.name
  }

  if (roomState.startingTeam === 'blue') {
    return blueTeam.name
  }

  return 'Czekam na start'
}

export function RuntimeStatusRail({
  open,
  roomId,
  redTeam,
  blueTeam,
  roundsToWin,
  roomState,
  status,
  railLabel,
}: RuntimeStatusRailProps) {
  const currentRound = roomState.roundWinsRed + roomState.roundWinsBlue + 1
  const redRevealed = roomState.cards.filter((card) => card.color === 'red' && card.revealed).length
  const blueRevealed = roomState.cards.filter((card) => card.color === 'blue' && card.revealed).length
  const neutralRevealed = roomState.cards.filter((card) => card.color === 'neutral' && card.revealed).length
  const assassinRevealed = roomState.cards.some((card) => card.color === 'assassin' && card.revealed)
  const totalRevealed = roomState.cards.filter((card) => card.revealed).length
  const totalCards = roomState.cards.length || 25
  const revealPercent = Math.round((totalRevealed / totalCards) * 100)
  const redRemaining = Math.max(roomState.redTotal - redRevealed, 0)
  const blueRemaining = Math.max(roomState.blueTotal - blueRevealed, 0)
  const statusToneClassName =
    status?.tone === 'danger' ? `${styles.alertCard} ${styles.alertCardDanger}` : styles.alertCard

  return (
    <aside className={open ? `${styles.rail} ${styles.railOpen}` : styles.rail} aria-hidden={!open}>
      <div className={styles.heroCard}>
        <div className={styles.heroTop}>
          <span className={styles.eyebrow}>Dowodzenie</span>
          <span className={styles.roundBadge}>Runda {currentRound}</span>
        </div>
        <div className={styles.scoreboard}>
          <div className={styles.teamScoreCard} data-team="red">
            <div className={styles.teamIdentity}>
              <div className={styles.teamAvatar} data-team="red">
                <AvatarAsset avatar={redTeam.avatar} size={28} />
              </div>
              <div className={styles.teamText}>
                <span className={styles.teamName}>{redTeam.name}</span>
                <span className={styles.teamSubline}>{redRemaining} do odkrycia</span>
              </div>
            </div>
            <strong className={styles.scoreValue}>{roomState.roundWinsRed}</strong>
          </div>

          <div className={styles.scoreDivider}>
            <span className={styles.scoreDividerLabel}>Mecz do {roundsToWin}</span>
            <strong className={styles.scoreDividerValue}>VS</strong>
          </div>

          <div className={styles.teamScoreCard} data-team="blue">
            <div className={styles.teamIdentity}>
              <div className={styles.teamAvatar} data-team="blue">
                <AvatarAsset avatar={blueTeam.avatar} size={28} />
              </div>
              <div className={styles.teamText}>
                <span className={styles.teamName}>{blueTeam.name}</span>
                <span className={styles.teamSubline}>{blueRemaining} do odkrycia</span>
              </div>
            </div>
            <strong className={styles.scoreValue}>{roomState.roundWinsBlue}</strong>
          </div>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Postęp planszy</span>
          <strong className={styles.metricValue}>{revealPercent}%</strong>
          <span className={styles.metricSubline}>
            {totalRevealed}/{totalCards} kart odkrytych
          </span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Start rundy</span>
          <strong className={styles.metricValueSmall}>{getStartingTeamName(roomState, redTeam, blueTeam)}</strong>
          <span className={styles.metricSubline}>Drużyna otwierająca planszę</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Neutralne</span>
          <strong className={styles.metricValue}>{neutralRevealed}</strong>
          <span className={styles.metricSubline}>Odkryte neutralne karty</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Zabójca</span>
          <strong className={styles.metricValueSmall}>{assassinRevealed ? 'Ujawniony' : 'Ukryty'}</strong>
          <span className={styles.metricSubline}>Status karty zabójcy</span>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Kapitanowie</span>
          <strong className={styles.sectionTitle}>Gotowość i łączność</strong>
        </div>
        <div className={styles.connectionList}>
          <div className={styles.connectionRow}>
            <span className={`${styles.connectionDot} ${roomState.captainRedConnected ? styles.connectionDotLive : styles.connectionDotOff}`} data-team="red" />
            <span className={styles.connectionName}>{redTeam.name}</span>
            <span className={roomState.captainRedConnected ? styles.connectionStateLive : styles.connectionStateOff}>
              {roomState.captainRedConnected ? (roomState.captainRedReady ? 'Gotowy' : 'Połączony') : 'Brak połączenia'}
            </span>
          </div>
          <div className={styles.connectionRow}>
            <span className={`${styles.connectionDot} ${roomState.captainBlueConnected ? styles.connectionDotLive : styles.connectionDotOff}`} data-team="blue" />
            <span className={styles.connectionName}>{blueTeam.name}</span>
            <span className={roomState.captainBlueConnected ? styles.connectionStateLive : styles.connectionStateOff}>
              {roomState.captainBlueConnected ? (roomState.captainBlueReady ? 'Gotowy' : 'Połączony') : 'Brak połączenia'}
            </span>
          </div>
        </div>
      </div>

      {status ? (
        <div className={statusToneClassName}>
          <span className={styles.eyebrow}>{status.eyebrow}</span>
          <strong className={styles.sectionTitle}>{status.title}</strong>
          <p className={styles.alertCopy}>{status.description}</p>
        </div>
      ) : null}

      <div className={styles.footerCard}>
        <div>
          <span className={styles.eyebrow}>Pokój</span>
          <strong className={styles.roomCode}>{roomId}</strong>
        </div>
        {railLabel ? <span className={styles.hint}>Panel statusu: {railLabel}</span> : null}
      </div>
    </aside>
  )
}

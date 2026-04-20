'use client'

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
  return (
    <aside className={open ? `${styles.rail} ${styles.railOpen}` : styles.rail} aria-hidden={!open}>
      <div className={styles.section}>
        <span className={styles.eyebrow}>Mecz</span>
        <strong className={styles.title}>
          {redTeam.name} {roomState.roundWinsRed}:{roomState.roundWinsBlue} {blueTeam.name}
        </strong>
        <p className={styles.copy}>Do wygrania potrzeba {roundsToWin} rund.</p>
      </div>

      <div className={styles.section}>
        <span className={styles.eyebrow}>Start rundy</span>
        <p className={styles.copy}>
          Zaczynają: {roomState.startingTeam === 'red' ? redTeam.name : roomState.startingTeam === 'blue' ? blueTeam.name : 'czekam'}
        </p>
      </div>

      <div className={styles.section}>
        <span className={styles.eyebrow}>Kapitanowie</span>
        <p className={styles.copy}>Czerwoni: {roomState.captainRedConnected ? 'połączeni' : 'brak połączenia'}</p>
        <p className={styles.copy}>Niebiescy: {roomState.captainBlueConnected ? 'połączeni' : 'brak połączenia'}</p>
      </div>

      {status ? (
        <div className={styles.section}>
          <span className={styles.eyebrow}>{status.eyebrow}</span>
          <strong className={styles.title}>{status.title}</strong>
          <p className={styles.copy}>{status.description}</p>
        </div>
      ) : null}

      <div className={styles.section}>
        <span className={styles.eyebrow}>Pokój</span>
        <p className={styles.copy}>Kod: {roomId}</p>
        {railLabel ? <span className={styles.hint}>Panel statusu: {railLabel}</span> : null}
      </div>
    </aside>
  )
}

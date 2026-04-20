'use client'

import { CaptainScreen, buildCaptainRoutePath, useCaptainRoomStatus } from '@party/codenames'
import { AvatarAsset } from '@party/ui'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

type CaptainTeam = { name: string; avatar: string }

const DEFAULT_TEAMS: [CaptainTeam, CaptainTeam] = [
  { name: 'Czerwoni', avatar: 'star' },
  { name: 'Niebiescy', avatar: 'moon' },
]

export function CaptainRouteScreen({
  roomId,
  teamParam,
}: {
  roomId: string
  teamParam: string | null
}) {
  const router = useRouter()
  const { roomState } = useCaptainRoomStatus({ roomId })
  const redTeam = roomState.redTeam.name ? roomState.redTeam : DEFAULT_TEAMS[0]
  const blueTeam = roomState.blueTeam.name ? roomState.blueTeam : DEFAULT_TEAMS[1]

  if (teamParam !== 'red' && teamParam !== 'blue') {
    return (
      <CaptainTeamSelect
        roomId={roomId}
        redTeam={redTeam}
        blueTeam={blueTeam}
        onChooseTeam={(team) => router.replace(buildCaptainRoutePath(roomId, team))}
      />
    )
  }

  return (
    <CaptainScreen
      roomId={roomId}
      team={teamParam}
      redTeam={redTeam}
      blueTeam={blueTeam}
      onChangeRole={() => router.replace(buildCaptainRoutePath(roomId))}
    />
  )
}

function CaptainTeamSelect({
  roomId,
  redTeam,
  blueTeam,
  onChooseTeam,
}: {
  roomId: string
  redTeam: CaptainTeam
  blueTeam: CaptainTeam
  onChooseTeam: (team: 'red' | 'blue') => void
}) {
  const { roomState, hasSyncedRoomState } = useCaptainRoomStatus({ roomId })
  const redTaken = roomState.captainRedConnected
  const blueTaken = roomState.captainBlueConnected
  const statusCopy = !hasSyncedRoomState
    ? 'Sprawdzam dostępność drużyn...'
    : redTaken && blueTaken
      ? 'Obie drużyny mają już kapitanów.'
      : 'Wybierz wolną drużynę i przejmij klucz planszy.'

  return (
    <div className={styles.teamSelect}>
      <div className={styles.teamSelectGlow} aria-hidden="true" />
      <div className={styles.teamSelectShell}>
        <div className={styles.teamSelectHeader}>
          <span className={styles.teamSelectEyebrow}>Tajniacy</span>
          <h1 className={styles.teamSelectTitle}>Wybierz drużynę</h1>
          <p className={styles.teamSelectDesc}>{statusCopy}</p>
          <div className={styles.roomBadge}>
            <span className={styles.roomBadgeLabel}>Pokój</span>
            <strong className={styles.roomBadgeValue}>{roomId.toUpperCase()}</strong>
          </div>
        </div>

        <div className={styles.teamSelectButtons}>
          <button
            className={`${styles.teamBtn} ${styles.teamBtnRed}`}
            disabled={!hasSyncedRoomState || redTaken}
            onClick={() => onChooseTeam('red')}
          >
            <span className={styles.teamBtnGlow} aria-hidden="true" />
            <span className={styles.teamBtnEyebrow}>Kapitan</span>
            <div className={styles.teamBtnIdentity}>
              <div className={styles.teamBtnAvatar} data-team="red" aria-hidden="true">
                <AvatarAsset avatar={redTeam.avatar} size={54} />
              </div>
              <div className={styles.teamBtnNameBlock}>
                <span className={styles.teamBtnSystemName}>Czerwoni</span>
                <strong className={styles.teamBtnTitle}>{redTeam.name}</strong>
              </div>
            </div>
            <span className={styles.teamBtnDesc}>
              {redTaken ? `Drużyna ${redTeam.name} ma już swojego kapitana.` : `Przejmij klucz odpowiedzi drużyny ${redTeam.name}.`}
            </span>
            <span className={`${styles.teamBtnState} ${redTaken ? styles.teamBtnStateTaken : styles.teamBtnStateOpen}`}>
              {redTaken ? 'Zajęte' : 'Wolne'}
            </span>
          </button>

          <button
            className={`${styles.teamBtn} ${styles.teamBtnBlue}`}
            disabled={!hasSyncedRoomState || blueTaken}
            onClick={() => onChooseTeam('blue')}
          >
            <span className={styles.teamBtnGlow} aria-hidden="true" />
            <span className={styles.teamBtnEyebrow}>Kapitan</span>
            <div className={styles.teamBtnIdentity}>
              <div className={styles.teamBtnAvatar} data-team="blue" aria-hidden="true">
                <AvatarAsset avatar={blueTeam.avatar} size={54} />
              </div>
              <div className={styles.teamBtnNameBlock}>
                <span className={styles.teamBtnSystemName}>Niebiescy</span>
                <strong className={styles.teamBtnTitle}>{blueTeam.name}</strong>
              </div>
            </div>
            <span className={styles.teamBtnDesc}>
              {blueTaken ? `Drużyna ${blueTeam.name} ma już swojego kapitana.` : `Przejmij klucz odpowiedzi drużyny ${blueTeam.name}.`}
            </span>
            <span className={`${styles.teamBtnState} ${blueTaken ? styles.teamBtnStateTaken : styles.teamBtnStateOpen}`}>
              {blueTaken ? 'Zajęte' : 'Wolne'}
            </span>
          </button>
        </div>

        <div className={styles.teamSelectFooter}>
          <span className={styles.footerDot} data-team="red" aria-hidden="true" />
          <span className={styles.footerText}>Po wyborze zobaczysz planszę kapitana tylko dla swojej drużyny.</span>
          <span className={styles.footerDot} data-team="blue" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

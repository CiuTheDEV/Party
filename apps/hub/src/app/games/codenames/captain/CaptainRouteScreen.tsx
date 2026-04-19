'use client'

import { CaptainScreen, buildCaptainRoutePath, useCaptainRoomStatus } from '@party/codenames'
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
  redTeam = DEFAULT_TEAMS[0],
  blueTeam = DEFAULT_TEAMS[1],
}: {
  roomId: string
  teamParam: string | null
  redTeam?: CaptainTeam
  blueTeam?: CaptainTeam
}) {
  const router = useRouter()

  if (teamParam !== 'red' && teamParam !== 'blue') {
    return <CaptainTeamSelect roomId={roomId} onChooseTeam={(team) => router.replace(buildCaptainRoutePath(roomId, team))} />
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
  onChooseTeam,
}: {
  roomId: string
  onChooseTeam: (team: 'red' | 'blue') => void
}) {
  const { roomState, hasSyncedRoomState } = useCaptainRoomStatus({ roomId })
  const redTaken = roomState.captainRedConnected
  const blueTaken = roomState.captainBlueConnected

  return (
    <div className={styles.teamSelect}>
      <h1 className={styles.teamSelectTitle}>Wybierz dru\u017cyn\u0119</h1>
      <p className={styles.teamSelectDesc}>
        {!hasSyncedRoomState
          ? 'Sprawdzam dost\u0119pno\u015b\u0107 dru\u017cyn...'
          : redTaken && blueTaken
            ? 'Obie dru\u017cyny maj\u0105 ju\u017c kapitan\u00f3w.'
            : 'Wybierz tylko woln\u0105 dru\u017cyn\u0119.'}
      </p>
      <div className={styles.teamSelectButtons}>
        <button
          className={`${styles.teamBtn} ${styles.teamBtnRed}`}
          disabled={!hasSyncedRoomState || redTaken}
          onClick={() => onChooseTeam('red')}
        >
          Czerwoni
        </button>
        <button
          className={`${styles.teamBtn} ${styles.teamBtnBlue}`}
          disabled={!hasSyncedRoomState || blueTaken}
          onClick={() => onChooseTeam('blue')}
        >
          Niebiescy
        </button>
      </div>
    </div>
  )
}

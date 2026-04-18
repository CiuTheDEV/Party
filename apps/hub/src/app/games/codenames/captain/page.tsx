'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import { CaptainScreen } from '@party/codenames'
import { useCaptainRoomStatus } from '@party/codenames'
import styles from './page.module.css'

type CaptainTeam = { name: string; avatar: string }

const DEFAULT_TEAMS: [CaptainTeam, CaptainTeam] = [
  { name: 'Czerwoni', avatar: 'star' },
  { name: 'Niebiescy', avatar: 'moon' },
]

function CaptainPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomId = searchParams.get('room')
  const teamParam = searchParams.get('team')
  const redTeam: CaptainTeam = {
    name: searchParams.get('redName') ?? DEFAULT_TEAMS[0].name,
    avatar: searchParams.get('redAvatar') ?? DEFAULT_TEAMS[0].avatar,
  }
  const blueTeam: CaptainTeam = {
    name: searchParams.get('blueName') ?? DEFAULT_TEAMS[1].name,
    avatar: searchParams.get('blueAvatar') ?? DEFAULT_TEAMS[1].avatar,
  }
  const captainQuery = new URLSearchParams({
    room: roomId ?? '',
    redName: redTeam.name,
    redAvatar: redTeam.avatar,
    blueName: blueTeam.name,
    blueAvatar: blueTeam.avatar,
  })
  const buildCaptainHref = (team?: 'red' | 'blue') => {
    const query = new URLSearchParams(captainQuery)
    if (team) {
      query.set('team', team)
    } else {
      query.delete('team')
    }
    return `/games/codenames/captain?${query.toString()}`
  }

  if (!roomId) {
    if (typeof window !== 'undefined') {
      router.replace('/games/codenames')
    }
    return null
  }

  if (teamParam !== 'red' && teamParam !== 'blue') {
    return <CaptainTeamSelect roomId={roomId} onChooseTeam={(selectedTeam) => router.replace(buildCaptainHref(selectedTeam))} />
  }

  return (
    <CaptainScreen
      roomId={roomId}
      team={teamParam}
      redTeam={redTeam}
      blueTeam={blueTeam}
      onChangeRole={() => router.replace(buildCaptainHref())}
    />
  )
}

type CaptainTeamSelectProps = {
  roomId: string
  onChooseTeam: (team: 'red' | 'blue') => void
}

function CaptainTeamSelect({ roomId, onChooseTeam }: CaptainTeamSelectProps) {
  const router = useRouter()
  const { roomState, hasSyncedRoomState, hostDisconnected } = useCaptainRoomStatus({ roomId })
  const redTaken = roomState.captainRedConnected
  const blueTaken = roomState.captainBlueConnected

  useEffect(() => {
    if (hasSyncedRoomState && hostDisconnected) {
      router.replace('/games/codenames')
    }
  }, [hasSyncedRoomState, hostDisconnected, router])

  return (
    <div className={styles.teamSelect}>
      <h1 className={styles.teamSelectTitle}>Wybierz drużynę</h1>
      <p className={styles.teamSelectDesc}>
        {!hasSyncedRoomState
          ? 'Sprawdzam dostępność drużyn...'
          : redTaken && blueTaken
            ? 'Obie drużyny mają już kapitanów.'
            : 'Wybierz tylko wolną drużynę.'}
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

export default function CaptainPage() {
  return (
    <Suspense>
      <CaptainPageContent />
    </Suspense>
  )
}

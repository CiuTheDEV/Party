'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { CaptainScreen } from '@party/codenames'
import styles from './page.module.css'

function CaptainPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomId = searchParams.get('room')
  const teamParam = searchParams.get('team')

  if (!roomId) {
    if (typeof window !== 'undefined') {
      router.replace('/games/codenames')
    }
    return null
  }

  if (teamParam !== 'red' && teamParam !== 'blue') {
    return (
      <div className={styles.teamSelect}>
        <h1 className={styles.teamSelectTitle}>Wybierz druzyne</h1>
        <p className={styles.teamSelectDesc}>Jestes kapitanem ktorej druzyny?</p>
        <div className={styles.teamSelectButtons}>
          <button
            className={`${styles.teamBtn} ${styles.teamBtnRed}`}
            onClick={() => router.replace(`/games/codenames/captain?room=${roomId}&team=red`)}
          >
            Czerwoni
          </button>
          <button
            className={`${styles.teamBtn} ${styles.teamBtnBlue}`}
            onClick={() => router.replace(`/games/codenames/captain?room=${roomId}&team=blue`)}
          >
            Niebiescy
          </button>
        </div>
      </div>
    )
  }

  return <CaptainScreen roomId={roomId} team={teamParam} />
}

export default function CaptainPage() {
  return (
    <Suspense>
      <CaptainPageContent />
    </Suspense>
  )
}

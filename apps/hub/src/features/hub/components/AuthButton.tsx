'use client'

import { useRouter } from 'next/navigation'
import { useAuth, useProfileModal } from '@/app/providers'
import { getPartyAvatarAssetSrc } from '@party/ui'
import styles from './AuthButton.module.css'

export function AuthButton() {
  const { user, isLoading } = useAuth()
  const { openProfile } = useProfileModal()
  const router = useRouter()

  if (isLoading) {
    return (
      <button type="button" className={styles.loginButton} disabled>
        Zaloguj się
      </button>
    )
  }

  if (user) {
    return (
      <button type="button" className={styles.accountButton} onClick={openProfile} title={user.email}>
        <img
          src={getPartyAvatarAssetSrc(user.avatarId, 'static').src}
          alt="Twój awatar"
          width={28}
          height={28}
          className={styles.accountAvatar}
        />
        {user.displayName}
      </button>
    )
  }

  return (
    <button
      type="button"
      className={styles.loginButton}
      onClick={() => {
        router.push('/auth')
      }}
    >
      Zaloguj się
    </button>
  )
}

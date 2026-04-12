'use client'

import Link from 'next/link'
import { Epilogue, Manrope } from 'next/font/google'
import styles from './Topbar.module.css'

type TopbarProps = {
  brandHref?: string
  brandLabel: string
  userSlot?: React.ReactNode
}

const headingFont = Epilogue({ subsets: ['latin'], weight: ['700', '800', '900'] })
const bodyFont = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] })

export function Topbar({ brandHref = '/', brandLabel, userSlot }: TopbarProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.topbarInner}>
        <Link href={brandHref} className={`${styles.topbarBrand} ${headingFont.className}`}>
          {brandLabel}
        </Link>

        <div className={`${styles.loginButton} ${bodyFont.className}`}>
          {userSlot}
        </div>
      </div>
    </header>
  )
}

'use client'

import Link from 'next/link'
import styles from './Topbar.module.css'

type TopbarProps = {
  brandHref?: string
  brandLabel: string
  userSlot?: React.ReactNode
}

const headingFont = { className: '' }
const bodyFont = { className: '' }

export function Topbar({ brandHref = '/', brandLabel, userSlot }: TopbarProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.topbarInner}>
        <Link href={brandHref} className={`${styles.topbarBrand} ${headingFont.className}`}>
          {brandLabel}
        </Link>

        <div className={bodyFont.className}>
          {userSlot}
        </div>
      </div>
    </header>
  )
}

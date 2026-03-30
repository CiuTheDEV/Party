'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Home } from 'lucide-react'
import styles from './GameSidebar.module.css'

export type NavLink = {
  label: string
  href: string
  icon?: ReactNode
  disabled?: boolean
}

type GameSidebarProps = {
  gameName: string
  gameEmoji: string
  links: NavLink[]
}

export function GameSidebar({ gameName, gameEmoji, links }: GameSidebarProps) {
  const pathname = usePathname()

  const handleNavigate = () => {
    requestAnimationFrame(() => {
      const activeElement = document.activeElement

      if (activeElement instanceof HTMLElement) {
        activeElement.blur()
      }
    })
  }

  return (
    <>
      <aside className={styles.sidebar} aria-label={`Nawigacja gry ${gameName}`}>
        <div className={styles.railInner}>
          {links.map((link) =>
            link.disabled ? (
              <span
                key={link.href}
                className={`${styles.navLink} ${styles.navLinkDisabled}`}
                aria-disabled="true"
              >
                {link.icon && <span className={styles.navIcon}>{link.icon}</span>}
                <span className={styles.navLabel}>{link.label}</span>
              </span>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
                onClick={handleNavigate}
              >
                {link.icon && <span className={styles.navIcon}>{link.icon}</span>}
                <span className={styles.navLabel}>{link.label}</span>
              </Link>
            )
          )}

          <div className={styles.railSpacer} />

          <Link href="/" className={styles.backLink} onClick={handleNavigate}>
            <span className={styles.navIcon} aria-hidden="true">
              <ArrowLeft size={18} />
            </span>
            <span className={styles.navLabel}>Wróć do lobby</span>
          </Link>
        </div>
      </aside>

      <nav className={styles.tabBar} aria-label={`Dolna nawigacja gry ${gameName}`}>
        {links.map((link) =>
          link.disabled ? (
            <span
              key={link.href}
              className={`${styles.tabItem} ${styles.tabDisabled}`}
              aria-disabled="true"
            >
              {link.icon && <span className={styles.tabIcon}>{link.icon}</span>}
              <span className={styles.tabLabel}>{link.label}</span>
            </span>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.tabItem} ${pathname === link.href ? styles.tabActive : ''}`}
              onClick={handleNavigate}
            >
              {link.icon && <span className={styles.tabIcon}>{link.icon}</span>}
              <span className={styles.tabLabel}>{link.label}</span>
            </Link>
          )
        )}

        <Link href="/" className={styles.tabItem} aria-label={`Wróć do lobby ${gameEmoji}`} onClick={handleNavigate}>
          <span className={styles.tabIcon}>
            <Home size={18} />
          </span>
          <span className={styles.tabLabel}>Lobby</span>
        </Link>
      </nav>
    </>
  )
}

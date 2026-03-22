'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './GameSidebar.module.css'

export type NavLink = {
  label: string
  href: string
  icon?: string
}

type GameSidebarProps = {
  gameName: string
  gameEmoji: string
  links: NavLink[]
}

export function GameSidebar({ gameName, gameEmoji, links }: GameSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.gameHeader}>
          <span className={styles.gameEmoji}>{gameEmoji}</span>
          <span className={styles.gameName}>{gameName}</span>
        </div>
        <nav className={styles.nav}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
            >
              {link.icon && <span className={styles.navIcon}>{link.icon}</span>}
              {link.label}
            </Link>
          ))}
        </nav>
        <div className={styles.bottom}>
          <Link href="/" className={styles.backLink}>← Wróć do lobby</Link>
        </div>
      </aside>

      {/* Mobile tab bar */}
      <nav className={styles.tabBar}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.tabItem} ${pathname === link.href ? styles.tabActive : ''}`}
          >
            {link.icon && <span>{link.icon}</span>}
            <span className={styles.tabLabel}>{link.label}</span>
          </Link>
        ))}
        <Link href="/" className={styles.tabItem}>
          <span>🏠</span>
          <span className={styles.tabLabel}>Lobby</span>
        </Link>
      </nav>
    </>
  )
}

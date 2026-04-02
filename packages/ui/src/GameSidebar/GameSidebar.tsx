'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './GameSidebar.module.css'

export type NavLink = {
  label: string
  href: string
  icon?: ReactNode
  disabled?: boolean
  pinnedBottom?: boolean
  onSelect?: () => void
}

export type SidebarFooterLink = {
  href: string
  label: string
  icon?: ReactNode
  mobileIcon?: ReactNode
  mobileLabel?: string
  ariaLabel?: string
}

type GameSidebarProps = {
  activeHref?: string
  ariaLabel: string
  footerLink?: SidebarFooterLink
  links: NavLink[]
  onNavigate?: (href: string) => void
}

export function GameSidebar({ activeHref, ariaLabel, footerLink, links, onNavigate }: GameSidebarProps) {
  const pathname = usePathname()
  const resolvedActiveHref = activeHref ?? pathname
  const topLinks = links.filter((link) => !link.pinnedBottom)
  const bottomLinks = links.filter((link) => link.pinnedBottom)

  const handleNavigate = (href: string, onSelect?: () => void) => {
    onNavigate?.(href)
    onSelect?.()

    requestAnimationFrame(() => {
      const activeElement = document.activeElement

      if (activeElement instanceof HTMLElement) {
        activeElement.blur()
      }
    })
  }

  const getDesktopClassName = (href: string) =>
    href === resolvedActiveHref ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink

  const getMobileClassName = (href: string) =>
    href === resolvedActiveHref ? `${styles.tabItem} ${styles.tabActive}` : styles.tabItem

  const renderDesktopItem = (link: NavLink) => {
    if (link.disabled) {
      return (
        <span key={link.href} className={`${styles.navLink} ${styles.navLinkDisabled}`} aria-disabled="true">
          {link.icon ? <span className={styles.navIcon}>{link.icon}</span> : null}
          <span className={styles.navLabel}>{link.label}</span>
        </span>
      )
    }

    if (link.onSelect) {
      return (
        <button
          key={link.href}
          className={getDesktopClassName(link.href)}
          type="button"
          onClick={() => handleNavigate(link.href, link.onSelect)}
        >
          {link.icon ? <span className={styles.navIcon}>{link.icon}</span> : null}
          <span className={styles.navLabel}>{link.label}</span>
        </button>
      )
    }

    return (
      <Link
        key={link.href}
        href={link.href}
        className={getDesktopClassName(link.href)}
        onClick={() => handleNavigate(link.href)}
      >
        {link.icon ? <span className={styles.navIcon}>{link.icon}</span> : null}
        <span className={styles.navLabel}>{link.label}</span>
      </Link>
    )
  }

  const renderMobileItem = (link: NavLink) => {
    if (link.disabled) {
      return (
        <span key={link.href} className={`${styles.tabItem} ${styles.tabDisabled}`} aria-disabled="true">
          {link.icon ? <span className={styles.tabIcon}>{link.icon}</span> : null}
          <span className={styles.tabLabel}>{link.label}</span>
        </span>
      )
    }

    if (link.onSelect) {
      return (
        <button
          key={link.href}
          className={getMobileClassName(link.href)}
          type="button"
          onClick={() => handleNavigate(link.href, link.onSelect)}
        >
          {link.icon ? <span className={styles.tabIcon}>{link.icon}</span> : null}
          <span className={styles.tabLabel}>{link.label}</span>
        </button>
      )
    }

    return (
      <Link
        key={link.href}
        href={link.href}
        className={getMobileClassName(link.href)}
        onClick={() => handleNavigate(link.href)}
      >
        {link.icon ? <span className={styles.tabIcon}>{link.icon}</span> : null}
        <span className={styles.tabLabel}>{link.label}</span>
      </Link>
    )
  }

  return (
    <>
      <aside className={styles.sidebar} aria-label={ariaLabel}>
        <div className={styles.railInner}>
          {topLinks.map(renderDesktopItem)}

          <div className={styles.railSpacer} />

          {bottomLinks.map(renderDesktopItem)}

          {footerLink ? (
            <Link
              href={footerLink.href}
              className={styles.backLink}
              aria-label={footerLink.ariaLabel}
              onClick={() => handleNavigate(footerLink.href)}
            >
              {footerLink.icon ? <span className={styles.navIcon}>{footerLink.icon}</span> : null}
              <span className={styles.navLabel}>{footerLink.label}</span>
            </Link>
          ) : null}
        </div>
      </aside>

      <nav className={styles.tabBar} aria-label={ariaLabel}>
        {topLinks.map(renderMobileItem)}
        {bottomLinks.map(renderMobileItem)}

        {footerLink ? (
          <Link
            href={footerLink.href}
            className={styles.tabItem}
            aria-label={footerLink.ariaLabel}
            onClick={() => handleNavigate(footerLink.href)}
          >
            {footerLink.mobileIcon ? <span className={styles.tabIcon}>{footerLink.mobileIcon}</span> : null}
            <span className={styles.tabLabel}>{footerLink.mobileLabel ?? footerLink.label}</span>
          </Link>
        ) : null}
      </nav>
    </>
  )
}

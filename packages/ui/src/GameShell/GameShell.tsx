import { Topbar } from '../Topbar/Topbar'
import { GameSidebar } from '../GameSidebar/GameSidebar'
import type { NavLink, SidebarFooterLink } from '../GameSidebar/GameSidebar'
import styles from './GameShell.module.css'

type GameShellProps = {
  activeHref?: string
  brandHref?: string
  brandLabel: string
  footerLink?: SidebarFooterLink
  links: NavLink[]
  mainClassName?: string
  mainId?: string
  navAriaLabel: string
  onNavigate?: (href: string) => void
  rootClassName?: string
  children: React.ReactNode
}

export function GameShell({
  activeHref,
  brandHref,
  brandLabel,
  footerLink,
  links,
  mainClassName,
  mainId,
  navAriaLabel,
  onNavigate,
  rootClassName,
  children,
}: GameShellProps) {
  return (
    <div className={rootClassName ? `${styles.root} ${rootClassName}` : styles.root}>
      <Topbar brandLabel={brandLabel} brandHref={brandHref} />
      <div className={styles.body}>
        <GameSidebar
          activeHref={activeHref}
          ariaLabel={navAriaLabel}
          footerLink={footerLink}
          links={links}
          onNavigate={onNavigate}
        />
        <main id={mainId} className={mainClassName ? `${styles.main} ${mainClassName}` : styles.main}>
          {children}
        </main>
      </div>
    </div>
  )
}

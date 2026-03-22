import { Topbar } from '../Topbar/Topbar'
import { GameSidebar } from '../GameSidebar/GameSidebar'
import type { NavLink } from '../GameSidebar/GameSidebar'
import styles from './GameShell.module.css'

type GameShellProps = {
  gameName: string
  gameEmoji: string
  links: NavLink[]
  children: React.ReactNode
}

export function GameShell({ gameName, gameEmoji, links, children }: GameShellProps) {
  return (
    <div className={styles.root}>
      <Topbar gameName={gameName} />
      <div className={styles.body}>
        <GameSidebar gameName={gameName} gameEmoji={gameEmoji} links={links} />
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  )
}

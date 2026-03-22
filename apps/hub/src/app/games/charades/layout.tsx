import { GameShell } from '@party/ui'
import type { NavLink } from '@party/ui'
import './theme.css'

const links: NavLink[] = [
  { label: 'Menu gry', href: '/games/charades' },
  { label: 'Konfiguracja', href: '/games/charades/config' },
]

export default function CharadesLayout({ children }: { children: React.ReactNode }) {
  return (
    <GameShell gameName="Kalambury" gameEmoji="🎭" links={links}>
      {children}
    </GameShell>
  )
}

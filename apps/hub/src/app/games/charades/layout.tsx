import { GameShell } from '@party/ui'
import type { NavLink } from '@party/ui'
import './theme.css'

const links: NavLink[] = [
  { label: 'Menu gry', href: '/games/charades' },
  { label: 'Konfiguracja', href: '/games/charades/config' },
  { label: 'Ustawienia', href: '/games/charades/settings', disabled: true },
  { label: 'Rankingi', href: '/games/charades/rankings', disabled: true },
]

export default function CharadesLayout({ children }: { children: React.ReactNode }) {
  return (
    <GameShell gameName="Kalambury" gameEmoji="🎭" links={links}>
      {children}
    </GameShell>
  )
}

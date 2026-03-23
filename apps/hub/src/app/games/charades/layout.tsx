import { GameShell } from '@party/ui'
import type { NavLink } from '@party/ui'
import { Play, Settings, BarChart2, Gamepad2 } from 'lucide-react'
import './theme.css'

const links: NavLink[] = [
  { label: 'Menu gry', href: '/games/charades', icon: <Play size={16} /> },
  { label: 'Konfiguracja', href: '/games/charades/config', icon: <Gamepad2 size={16} /> },
  { label: 'Ustawienia', href: '/games/charades/settings', icon: <Settings size={16} />, disabled: true },
  { label: 'Rankingi', href: '/games/charades/rankings', icon: <BarChart2 size={16} />, disabled: true },
]

export default function CharadesLayout({ children }: { children: React.ReactNode }) {
  return (
    <GameShell gameName="Kalambury" gameEmoji="🎭" links={links}>
      {children}
    </GameShell>
  )
}

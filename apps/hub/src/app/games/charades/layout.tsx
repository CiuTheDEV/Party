'use client'

import { GameShell } from '@party/ui'
import type { NavLink } from '@party/ui'
import { useSelectedLayoutSegment } from 'next/navigation'
import { Play, Settings, BarChart2 } from 'lucide-react'
import './theme.css'

const links: NavLink[] = [
  { label: 'Menu gry', href: '/games/charades', icon: <Play size={18} /> },
  { label: 'Ustawienia', href: '/games/charades/settings', icon: <Settings size={18} />, disabled: true },
  { label: 'Rankingi', href: '/games/charades/rankings', icon: <BarChart2 size={18} />, disabled: true },
]

export default function CharadesLayout({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment()

  if (segment === 'play') {
    return <>{children}</>
  }

  return (
    <GameShell gameName="Kalambury" gameEmoji="🎭" links={links}>
      {children}
    </GameShell>
  )
}

'use client'

import { charadesModule } from '@party/charades'
import { GameShell } from '@party/ui'
import type { NavLink } from '@party/ui'
import { BarChart2, Play, Settings } from 'lucide-react'
import { useSelectedLayoutSegment } from 'next/navigation'
import './theme.css'

function mapNavIcon(icon: string | undefined) {
  switch (icon) {
    case 'play':
      return <Play size={18} />
    case 'settings':
      return <Settings size={18} />
    case 'rankings':
      return <BarChart2 size={18} />
    default:
      return undefined
  }
}

export default function CharadesLayout({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment()
  const links: NavLink[] = charadesModule.shell.links.map((link) => ({
    ...link,
    icon: mapNavIcon(link.icon),
  }))

  if (segment === 'play' || segment === 'present') {
    return <>{children}</>
  }

  return (
    <GameShell
      gameName={charadesModule.shell.gameName}
      gameEmoji={charadesModule.shell.gameEmoji}
      links={links}
    >
      {children}
    </GameShell>
  )
}

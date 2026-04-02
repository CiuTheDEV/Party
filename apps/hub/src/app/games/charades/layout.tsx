'use client'

import { charadesModule } from '@party/charades'
import { GameShell } from '@party/ui'
import type { NavLink, SidebarFooterLink } from '@party/ui'
import { ArrowLeft, BarChart2, Home, Play, Settings } from 'lucide-react'
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
  const footerLink: SidebarFooterLink = {
    href: '/',
    label: 'Wróć do lobby',
    mobileLabel: 'Lobby',
    icon: <ArrowLeft size={18} />,
    mobileIcon: <Home size={18} />,
    ariaLabel: 'Wróć do lobby',
  }

  if (segment === 'play' || segment === 'present') {
    return <>{children}</>
  }

  return (
    <GameShell
      brandLabel={`PROJECT PARTY / ${charadesModule.shell.gameName.toUpperCase()}`}
      footerLink={footerLink}
      links={links}
      navAriaLabel={`Nawigacja gry ${charadesModule.shell.gameName}`}
    >
      {children}
    </GameShell>
  )
}

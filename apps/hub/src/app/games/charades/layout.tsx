'use client'

import {
  charadesModule,
  getCharadesMenuActiveHref,
  resolveCharadesMenuViewFromHref,
  type CharadesMenuView,
} from '@party/charades'
import { GameShell } from '@party/ui'
import type { NavLink, SidebarFooterLink } from '@party/ui'
import { ArrowLeft, BarChart2, Home, Play, Settings } from 'lucide-react'
import { useSelectedLayoutSegment } from 'next/navigation'
import { useState } from 'react'
import { CharadesMenuViewProvider } from './menu-view-context'
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
  const [activeMenuView, setActiveMenuView] = useState<CharadesMenuView>('mode')

  const links: NavLink[] = charadesModule.shell.links.map((link) => {
    const mappedView = resolveCharadesMenuViewFromHref(link.href)

    return {
      ...link,
      icon: mapNavIcon(link.icon),
      onSelect: mappedView ? () => setActiveMenuView(mappedView) : undefined,
    }
  })

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
    <CharadesMenuViewProvider activeMenuView={activeMenuView} setActiveMenuView={setActiveMenuView}>
      <GameShell
        activeHref={segment ? undefined : getCharadesMenuActiveHref(activeMenuView)}
        brandLabel={`PROJECT PARTY / ${charadesModule.shell.gameName.toUpperCase()}`}
        footerLink={footerLink}
        links={links}
        navAriaLabel={`Nawigacja gry ${charadesModule.shell.gameName}`}
      >
        {children}
      </GameShell>
    </CharadesMenuViewProvider>
  )
}

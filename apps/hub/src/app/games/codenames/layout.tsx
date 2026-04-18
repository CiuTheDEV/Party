'use client'

import {
  codenamesModule,
  CODENAMES_NAVIGATION_SCREENS,
  CODENAMES_NAVIGATION_TARGETS,
  CODENAMES_NAVIGATION_ZONES,
  getCodenamesMenuActiveHref,
  getCodenamesMenuEntryTarget,
  getCodenamesRailHref,
  getCodenamesRailTargetFromHref,
  resolveCodenamesMenuViewFromHref,
  useMenuControls,
  type CodenamesMenuView,
} from '@party/codenames'
import { GameShell, HostNavigationProvider, useHostNavigation } from '@party/ui'
import { AuthButton } from '@/features/hub/components/AuthButton'
import type { NavLink, SidebarFooterLink } from '@party/ui'
import { ArrowLeft, Home, Play, Settings } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelectedLayoutSegment } from 'next/navigation'
import { CodenamesMenuViewProvider } from './menu-view-context'
import './theme.css'

function mapNavIcon(icon: string | undefined) {
  switch (icon) {
    case 'play':
      return <Play size={18} />
    case 'settings':
      return <Settings size={18} />
    default:
      return undefined
  }
}

function CodenamesLayoutShell({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment()
  const [activeMenuView, setActiveMenuView] = useState<CodenamesMenuView>('mode')
  const [isRailForcedExpanded, setIsRailForcedExpanded] = useState(false)
  const [isMenuInputSuspended, setIsMenuInputSuspended] = useState(false)
  const [hasUnsavedSettingsChanges, setHasUnsavedSettingsChanges] = useState(false)
  const wakeDeviceRef = useRef<'keyboard' | 'controller'>('keyboard')
  const settingsExitGuardRef = useRef<((view: CodenamesMenuView) => boolean) | null>(null)
  const hostNavigation = useHostNavigation()

  const activeMenuHref = useMemo(() => getCodenamesMenuActiveHref(activeMenuView), [activeMenuView])
  const menuFocusArea =
    !hostNavigation.state.isAwake
      ? null
      : hostNavigation.state.zoneId === CODENAMES_NAVIGATION_ZONES.rail
        ? 'rail'
        : 'content'
  const railFocusedHref = getCodenamesRailHref(hostNavigation.state.targetId)

  const links: NavLink[] = useMemo(
    () =>
      codenamesModule.shell.links.map((link: (typeof codenamesModule.shell.links)[number]) => {
        const mappedView = resolveCodenamesMenuViewFromHref(link.href)

        return {
          ...link,
          icon: mapNavIcon(link.icon),
          onSelect: mappedView ? () => requestMenuViewChange(mappedView) : undefined,
        }
      }),
    [requestMenuViewChange],
  )

  const footerLink: SidebarFooterLink = {
    href: '/',
    label: 'Wroc do lobby',
    mobileLabel: 'Lobby',
    icon: <ArrowLeft size={18} />,
    mobileIcon: <Home size={18} />,
    ariaLabel: 'Wroc do lobby',
  }

  function focusMenuContent() {
    const entryTarget = getCodenamesMenuEntryTarget()
    hostNavigation.setFocus({
      screenId: CODENAMES_NAVIGATION_SCREENS.menu,
      zoneId: entryTarget.zoneId,
      targetId: entryTarget.targetId,
    })
  }

  function requestMenuViewChange(view: CodenamesMenuView) {
    if (activeMenuView === 'settings' && view !== 'settings') {
      const canExitSettings = settingsExitGuardRef.current?.(view) ?? true
      if (!canExitSettings) {
        return
      }
    }

    commitMenuViewChange(view)
  }

  function commitMenuViewChange(view: CodenamesMenuView) {
    setActiveMenuView(view)
    focusMenuContent()
    setIsRailForcedExpanded(false)
  }

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (event.pointerType !== 'mouse' || segment !== null) {
        return
      }

      hostNavigation.sleep('mouse')
      setIsRailForcedExpanded(false)
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [hostNavigation, segment])

  useMenuControls({
    enabled: segment === null && activeMenuView === 'mode' && !hostNavigation.state.isAwake && !isMenuInputSuspended,
    onAction: (_action, input) => {
      const nextDevice = input?.device ?? wakeDeviceRef.current
      hostNavigation.wake(nextDevice)
      focusMenuContent()
      setIsRailForcedExpanded(false)
    },
    onDeviceChange: (device) => {
      wakeDeviceRef.current = device
    },
  })

  useMenuControls({
    enabled:
      segment === null &&
      (activeMenuView === 'mode' || activeMenuView === 'settings') &&
      hostNavigation.state.isAwake &&
      hostNavigation.state.zoneId === CODENAMES_NAVIGATION_ZONES.rail &&
      !isMenuInputSuspended &&
      !hostNavigation.state.isControllerWakeGuardActive,
    onAction: (action) => {
      setIsRailForcedExpanded(true)

      if (action === 'up' || action === 'down') {
        const railTargets = links.filter((link) => !link.disabled).map((link) => link.href ?? '')
        const currentIndex = railTargets.indexOf(railFocusedHref)
        const nextIndex = action === 'up' ? currentIndex - 1 : currentIndex + 1
        const nextHref = railTargets[Math.max(0, Math.min(nextIndex, railTargets.length - 1))]
        if (nextHref) {
          hostNavigation.setFocus({
            screenId: CODENAMES_NAVIGATION_SCREENS.menu,
            zoneId: CODENAMES_NAVIGATION_ZONES.rail,
            targetId: getCodenamesRailTargetFromHref(nextHref),
          })
        }
        return
      }

      if (action === 'right') {
        focusMenuContent()
        setIsRailForcedExpanded(false)
        return
      }

      if (action === 'menu') {
        hostNavigation.setFocus({
          screenId: CODENAMES_NAVIGATION_SCREENS.menu,
          zoneId: CODENAMES_NAVIGATION_ZONES.rail,
          targetId: CODENAMES_NAVIGATION_TARGETS.railSettingsLink,
        })
        return
      }

      if (action === 'confirm' || action === 'primary') {
        const nextView = resolveCodenamesMenuViewFromHref(railFocusedHref)
        if (nextView) {
          requestMenuViewChange(nextView)
        }
      }
    },
  })

  // Runtime screens (play, captain) render without GameShell — same pattern as Charades
  if (segment === 'play' || segment === 'captain') {
    return <div className="theme-codenames">{children}</div>
  }

  return (
    <CodenamesMenuViewProvider
      activeMenuView={activeMenuView}
      requestMenuViewChange={requestMenuViewChange}
      commitMenuViewChange={commitMenuViewChange}
      menuFocusArea={menuFocusArea}
      setMenuFocusArea={(area) => {
        if (area === null) {
          hostNavigation.sleep('mouse')
          return
        }

        if (area === 'rail') {
          hostNavigation.setFocus({
            screenId: CODENAMES_NAVIGATION_SCREENS.menu,
            zoneId: CODENAMES_NAVIGATION_ZONES.rail,
            targetId: getCodenamesRailTargetFromHref(activeMenuHref),
          })
          return
        }

        focusMenuContent()
      }}
      railFocusedHref={railFocusedHref}
      setRailFocusedHref={(href) => {
        hostNavigation.setFocus({
          screenId: CODENAMES_NAVIGATION_SCREENS.menu,
          zoneId: CODENAMES_NAVIGATION_ZONES.rail,
          targetId: getCodenamesRailTargetFromHref(href),
        })
      }}
      isRailForcedExpanded={isRailForcedExpanded}
      setIsRailForcedExpanded={setIsRailForcedExpanded}
      isMenuInputSuspended={isMenuInputSuspended}
      setIsMenuInputSuspended={setIsMenuInputSuspended}
      isControllerWakeGuardActive={hostNavigation.state.isControllerWakeGuardActive}
      isHostInputAwake={hostNavigation.state.isAwake}
      wakeHostInput={(device = 'keyboard') => hostNavigation.wake(device)}
      sleepHostInput={() => hostNavigation.sleep('mouse')}
      hasUnsavedSettingsChanges={hasUnsavedSettingsChanges}
      setHasUnsavedSettingsChanges={setHasUnsavedSettingsChanges}
      registerSettingsExitGuard={(guard) => {
        settingsExitGuardRef.current = guard
      }}
    >
      <GameShell
        rootClassName="theme-codenames"
        activeHref={segment ? undefined : activeMenuHref}
        brandLabel={`PROJECT PARTY / ${codenamesModule.shell.gameName.toUpperCase()}`}
        footerLink={footerLink}
        focusedHref={menuFocusArea === 'rail' ? railFocusedHref : undefined}
        forceSidebarExpanded={menuFocusArea === 'rail' && isRailForcedExpanded}
        isSidebarFocusVisible={hostNavigation.state.isAwake && menuFocusArea === 'rail'}
        links={links}
        navAriaLabel={`Nawigacja gry ${codenamesModule.shell.gameName}`}
        userSlot={<AuthButton />}
      >
        {children}
      </GameShell>
    </CodenamesMenuViewProvider>
  )
}

export default function CodenamesLayout({ children }: { children: React.ReactNode }) {
  const initialTarget = getCodenamesMenuEntryTarget()

  return (
    <HostNavigationProvider
      initialAwake={false}
      screenId={CODENAMES_NAVIGATION_SCREENS.menu}
      zoneId={initialTarget.zoneId}
      targetId={initialTarget.targetId}
    >
      <CodenamesLayoutShell>{children}</CodenamesLayoutShell>
    </HostNavigationProvider>
  )
}

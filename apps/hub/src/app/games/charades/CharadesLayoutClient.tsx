'use client'

import {
  charadesModule,
  CHARADES_NAVIGATION_SCREENS,
  CHARADES_NAVIGATION_TARGETS,
  CHARADES_NAVIGATION_ZONES,
  getCharadesMenuActiveHref,
  getCharadesMenuEntryTarget,
  getCharadesRailHref,
  getCharadesRailTargetFromHref,
  getCurrentGamepadInputLabel,
  getNextRailFocusHref,
  listConnectedGamepads,
  pickPreferredGamepad,
  resolveCharadesMenuViewFromHref,
  useMenuControls,
  type CharadesMenuView,
} from '@party/charades'
import { GameShell, HostNavigationProvider, useHostNavigation } from '@party/ui'
import { AuthButton } from '@/features/hub/components/AuthButton'
import type { NavLink, SidebarFooterLink } from '@party/ui'
import { ArrowLeft, BarChart2, Home, Play, Settings } from 'lucide-react'
import { useSelectedLayoutSegment } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
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

function CharadesLayoutShell({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment()
  const [activeMenuView, setActiveMenuView] = useState<CharadesMenuView>('mode')
  const [isRailForcedExpanded, setIsRailForcedExpanded] = useState(false)
  const [isMenuInputSuspended, setIsMenuInputSuspended] = useState(false)
  const [hasUnsavedSettingsChanges, setHasUnsavedSettingsChanges] = useState(false)
  const wakeDeviceRef = useRef<'keyboard' | 'controller'>('keyboard')
  const settingsExitGuardRef = useRef<((view: CharadesMenuView) => boolean) | null>(null)
  const hostNavigation = useHostNavigation()

  const activeMenuHref = useMemo(() => getCharadesMenuActiveHref(activeMenuView), [activeMenuView])
  const menuFocusArea =
    !hostNavigation.state.isAwake
      ? null
      : hostNavigation.state.zoneId === CHARADES_NAVIGATION_ZONES.rail
        ? 'rail'
        : 'content'
  const railFocusedHref = getCharadesRailHref(hostNavigation.state.targetId)

  const links: NavLink[] = useMemo(
    () =>
      charadesModule.shell.links.map((link: (typeof charadesModule.shell.links)[number]) => {
        const mappedView = resolveCharadesMenuViewFromHref(link.href)

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

  const railLinkHrefs = links.filter((link) => !link.disabled).map((link) => link.href)

  function focusMenuContent() {
    const entryTarget = getCharadesMenuEntryTarget()
    hostNavigation.setFocus({
      screenId: CHARADES_NAVIGATION_SCREENS.menu,
      zoneId: entryTarget.zoneId,
      targetId: entryTarget.targetId,
    })
  }

  function requestMenuViewChange(view: CharadesMenuView) {
    if (activeMenuView === 'settings' && view !== 'settings') {
      const canExitSettings = settingsExitGuardRef.current?.(view) ?? true
      if (!canExitSettings) {
        return
      }
    }

    commitMenuViewChange(view)
  }

  function commitMenuViewChange(view: CharadesMenuView) {
    setActiveMenuView(view)
    focusMenuContent()
    setIsRailForcedExpanded(false)
  }

  function handleSettingsDirtyChange(value: boolean) {
    setHasUnsavedSettingsChanges(value)
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
      hostNavigation.state.zoneId === CHARADES_NAVIGATION_ZONES.rail &&
      !isMenuInputSuspended &&
      !hostNavigation.state.isControllerWakeGuardActive,
    onAction: (action) => {
      setIsRailForcedExpanded(true)

      if (action === 'up' || action === 'down') {
        const nextHref = getNextRailFocusHref(railLinkHrefs, railFocusedHref, action)
        hostNavigation.setFocus({
          screenId: CHARADES_NAVIGATION_SCREENS.menu,
          zoneId: CHARADES_NAVIGATION_ZONES.rail,
          targetId: getCharadesRailTargetFromHref(nextHref),
        })
        return
      }

      if (action === 'right') {
        focusMenuContent()
        setIsRailForcedExpanded(false)
        return
      }

      if (action === 'menu') {
        hostNavigation.setFocus({
          screenId: CHARADES_NAVIGATION_SCREENS.menu,
          zoneId: CHARADES_NAVIGATION_ZONES.rail,
          targetId: CHARADES_NAVIGATION_TARGETS.railSettingsLink,
        })
        return
      }

      if (action === 'confirm' || action === 'primary') {
        const nextView = resolveCharadesMenuViewFromHref(railFocusedHref)
        if (nextView) {
          requestMenuViewChange(nextView)
        }
      }
    },
  })

  useEffect(() => {
    if (!hostNavigation.state.isControllerWakeGuardActive) {
      return
    }

    let frameId = 0

    const tick = () => {
      const activeGamepad = pickPreferredGamepad(listConnectedGamepads())
      const currentInput = activeGamepad ? getCurrentGamepadInputLabel(activeGamepad) : null

      if (!currentInput) {
        hostNavigation.updateWakeGuard(true)
        return
      }

      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [hostNavigation, hostNavigation.state.isControllerWakeGuardActive])

  if (segment === 'play' || segment === 'present') {
    return <>{children}</>
  }

  return (
    <CharadesMenuViewProvider
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
            screenId: CHARADES_NAVIGATION_SCREENS.menu,
            zoneId: CHARADES_NAVIGATION_ZONES.rail,
            targetId: getCharadesRailTargetFromHref(activeMenuHref),
          })
          return
        }

        focusMenuContent()
      }}
      railFocusedHref={railFocusedHref}
      setRailFocusedHref={(href) => {
        hostNavigation.setFocus({
          screenId: CHARADES_NAVIGATION_SCREENS.menu,
          zoneId: CHARADES_NAVIGATION_ZONES.rail,
          targetId: getCharadesRailTargetFromHref(href),
        })
      }}
      isRailForcedExpanded={isRailForcedExpanded}
      setIsRailForcedExpanded={setIsRailForcedExpanded}
      isMenuInputSuspended={isMenuInputSuspended}
      setIsMenuInputSuspended={setIsMenuInputSuspended}
      isControllerWakeGuardActive={hostNavigation.state.isControllerWakeGuardActive}
      hasUnsavedSettingsChanges={hasUnsavedSettingsChanges}
      setHasUnsavedSettingsChanges={handleSettingsDirtyChange}
      registerSettingsExitGuard={(guard) => {
        settingsExitGuardRef.current = guard
      }}
      isHostInputAwake={hostNavigation.state.isAwake}
      wakeHostInput={(device = 'keyboard') => hostNavigation.wake(device)}
      sleepHostInput={() => hostNavigation.sleep('mouse')}
    >
      <GameShell
        rootClassName="theme-charades"
        activeHref={segment ? undefined : activeMenuHref}
        brandLabel={`PROJECT PARTY / ${charadesModule.shell.gameName.toUpperCase()}`}
        footerLink={footerLink}
        focusedHref={menuFocusArea === 'rail' ? railFocusedHref : undefined}
        forceSidebarExpanded={menuFocusArea === 'rail' && isRailForcedExpanded}
        isSidebarFocusVisible={hostNavigation.state.isAwake && menuFocusArea === 'rail'}
        links={links}
        navAriaLabel={`Nawigacja gry ${charadesModule.shell.gameName}`}
        userSlot={<AuthButton />}
      >
        {children}
      </GameShell>
    </CharadesMenuViewProvider>
  )
}

export default function CharadesLayoutClient({ children }: { children: React.ReactNode }) {
  const initialTarget = getCharadesMenuEntryTarget()

  return (
    <HostNavigationProvider
      initialAwake={false}
      screenId={CHARADES_NAVIGATION_SCREENS.menu}
      zoneId={initialTarget.zoneId}
      targetId={initialTarget.targetId}
    >
      <CharadesLayoutShell>{children}</CharadesLayoutShell>
    </HostNavigationProvider>
  )
}

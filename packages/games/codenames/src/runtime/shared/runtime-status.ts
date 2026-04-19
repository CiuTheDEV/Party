import type { RoomPhase } from './codenames-events'

type RuntimeTone = 'warning' | 'danger'

export type RuntimeStatus = {
  eyebrow: string
  title: string
  description: string
  tone: RuntimeTone
}

type CaptainRuntimeStatusParams = {
  phase: RoomPhase
  hostConnected: boolean
  captainRedConnected: boolean
  captainBlueConnected: boolean
  captainRedReady: boolean
  captainBlueReady: boolean
  boardUnlocked: boolean
  assassinTeam: 'red' | 'blue' | null
  roundWinsRed: number
  roundWinsBlue: number
  viewerTeam: 'red' | 'blue'
}

type HostRuntimeStatusParams = {
  phase: RoomPhase
  captainRedConnected: boolean
  captainBlueConnected: boolean
  captainRedReady: boolean
  captainBlueReady: boolean
  boardUnlocked: boolean
  assassinTeam: 'red' | 'blue' | null
}

function getDisconnectedCaptainLabel(captainRedConnected: boolean, captainBlueConnected: boolean) {
  if (!captainRedConnected) {
    return 'Kapitan Czerwonych'
  }

  if (!captainBlueConnected) {
    return 'Kapitan Niebieskich'
  }

  return null
}

function getTeamLabel(team: 'red' | 'blue') {
  return team === 'red' ? 'Czerwoni' : 'Niebiescy'
}

export function getCaptainRuntimeStatus({
  phase,
  hostConnected,
  captainRedConnected,
  captainBlueConnected,
  captainRedReady,
  captainBlueReady,
  boardUnlocked,
  assassinTeam,
  roundWinsRed,
  roundWinsBlue,
}: CaptainRuntimeStatusParams): RuntimeStatus | null {
  if (!hostConnected && phase !== 'waiting') {
    return {
      eyebrow: 'Pokoj zamkniety',
      title: 'Host opuscil pokoj.',
      description: 'Za chwile nastapi powrot do menu.',
      tone: 'danger',
    }
  }

  const disconnectedCaptainLabel = getDisconnectedCaptainLabel(captainRedConnected, captainBlueConnected)

  if (phase === 'playing' && !boardUnlocked) {
    const isFirstRound = roundWinsRed === 0 && roundWinsBlue === 0

    return {
      eyebrow: isFirstRound ? 'Gotowosc kapitanow' : 'Przekaz urzadzenie',
      title: isFirstRound ? 'Potwierdz gotowosc kapitana.' : 'Potwierdz gotowosc nowego kapitana.',
      description: isFirstRound
        ? 'Klucz planszy odblokuje sie dopiero, gdy oboje kapitanowie klikna Gotowy.'
        : 'Przekaz telefon nowemu kapitanowi. Klucz planszy odblokuje sie dopiero, gdy oboje kapitanowie klikna Gotowy.',
      tone: 'warning',
    }
  }

  if (disconnectedCaptainLabel && (phase === 'playing' || phase === 'assassin-reveal')) {
    return {
      eyebrow: 'Gra wstrzymana',
      title: `${disconnectedCaptainLabel} rozlaczyl sie.`,
      description: 'Plansza wznowi sie automatycznie po ponownym polaczeniu.',
      tone: 'warning',
    }
  }

  if (phase === 'assassin-reveal' && assassinTeam === null) {
    return {
      eyebrow: 'Uwaga',
      title: 'Ktos trafil zabojce.',
      description: 'Czekam na decyzje hosta, kto odkryl karte.',
      tone: 'danger',
    }
  }

  if (phase === 'ended' && assassinTeam) {
    return {
      eyebrow: 'Koniec rundy',
      title: `${getTeamLabel(assassinTeam)} trafili zabojce.`,
      description: 'Host przygotowuje kolejna plansze.',
      tone: 'danger',
    }
  }

  if (phase === 'ended') {
    return {
      eyebrow: 'Koniec rundy',
      title: 'Runda zostala zakonczona.',
      description: 'Host przygotowuje kolejna plansze.',
      tone: 'warning',
    }
  }

  return null
}

export function getHostRuntimeStatus({
  phase,
  captainRedConnected,
  captainBlueConnected,
  captainRedReady,
  captainBlueReady,
  boardUnlocked,
  assassinTeam,
}: HostRuntimeStatusParams): RuntimeStatus | null {
  const disconnectedCaptainLabel = getDisconnectedCaptainLabel(captainRedConnected, captainBlueConnected)

  if (phase === 'playing' && !boardUnlocked && captainRedConnected && captainBlueConnected) {
    const readyTeams = [
      captainRedReady ? 'Czerwoni' : null,
      captainBlueReady ? 'Niebiescy' : null,
    ].filter(Boolean)
    const waitingTeams = [
      captainRedReady ? null : 'Czerwoni',
      captainBlueReady ? null : 'Niebiescy',
    ].filter(Boolean)

    return {
      eyebrow: 'Oczekiwanie',
      title: 'Czekam na gotowosc kapitanow.',
      description: `Gotowy: ${readyTeams.join(', ') || 'nikt'}. Czeka: ${waitingTeams.join(', ') || 'nikt'}.`,
      tone: 'warning',
    }
  }

  if (disconnectedCaptainLabel && (phase === 'playing' || phase === 'assassin-reveal' || phase === 'waiting')) {
    return {
      eyebrow: 'Gra wstrzymana',
      title: `${disconnectedCaptainLabel} jest rozlaczony.`,
      description: 'Parowanie pozostaje otwarte, dopoki oba urzadzenia nie wroca.',
      tone: 'warning',
    }
  }

  if (phase === 'ended' && assassinTeam) {
    return {
      eyebrow: 'Koniec rundy',
      title: `${getTeamLabel(assassinTeam)} trafili zabojce.`,
      description: 'Mozesz przygotowac kolejna plansze albo zakonczyc mecz.',
      tone: 'danger',
    }
  }

  if (phase === 'ended') {
    return {
      eyebrow: 'Koniec rundy',
      title: 'Runda zostala zakonczona.',
      description: 'Wybierz kolejna plansze albo przejdz dalej do podsumowania.',
      tone: 'warning',
    }
  }

  return null
}

export function shouldWarnBeforeUnload(phase: RoomPhase) {
  return phase !== 'waiting'
}

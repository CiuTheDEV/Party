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
      eyebrow: 'Pokój zamknięty',
      title: 'Host opuścił pokój.',
      description: 'Za chwilę nastąpi powrót do menu.',
      tone: 'danger',
    }
  }

  const disconnectedCaptainLabel = getDisconnectedCaptainLabel(captainRedConnected, captainBlueConnected)

  if (phase === 'playing' && !boardUnlocked) {
    const isFirstRound = roundWinsRed === 0 && roundWinsBlue === 0

    return {
      eyebrow: isFirstRound ? 'Gotowość kapitanów' : 'Przekaż urządzenie',
      title: isFirstRound ? 'Potwierdź gotowość kapitana.' : 'Potwierdź gotowość nowego kapitana.',
      description: isFirstRound
        ? 'Klucz planszy odblokuje się dopiero, gdy oboje kapitanowie klikną Gotowy.'
        : 'Przekaż telefon nowemu kapitanowi. Klucz planszy odblokuje się dopiero, gdy oboje kapitanowie klikną Gotowy.',
      tone: 'warning',
    }
  }

  if (disconnectedCaptainLabel && (phase === 'playing' || phase === 'assassin-reveal')) {
    return {
      eyebrow: 'Gra wstrzymana',
      title: `${disconnectedCaptainLabel} rozłączył się.`,
      description: 'Plansza wznowi się automatycznie po ponownym połączeniu.',
      tone: 'warning',
    }
  }

  if (phase === 'assassin-reveal' && assassinTeam === null) {
    return {
      eyebrow: 'Uwaga',
      title: 'Ktoś trafił zabójcę.',
      description: 'Czekam na decyzję hosta, kto odkrył kartę.',
      tone: 'danger',
    }
  }

  if (phase === 'ended' && assassinTeam) {
    return {
      eyebrow: 'Koniec rundy',
      title: `${getTeamLabel(assassinTeam)} trafili zabójcę.`,
      description: 'Host przygotowuje kolejną planszę.',
      tone: 'danger',
    }
  }

  if (phase === 'ended') {
    return {
      eyebrow: 'Koniec rundy',
      title: 'Runda została zakończona.',
      description: 'Host przygotowuje kolejną planszę.',
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
      title: 'Czekam na gotowość kapitanów.',
      description: `Gotowy: ${readyTeams.join(', ') || 'nikt'}. Czeka: ${waitingTeams.join(', ') || 'nikt'}.`,
      tone: 'warning',
    }
  }

  if (disconnectedCaptainLabel && (phase === 'playing' || phase === 'assassin-reveal' || phase === 'waiting')) {
    return {
      eyebrow: 'Gra wstrzymana',
      title: `${disconnectedCaptainLabel} jest rozłączony.`,
      description: 'Parowanie pozostaje otwarte, dopóki oba urządzenia nie wrócą.',
      tone: 'warning',
    }
  }

  if (phase === 'ended' && assassinTeam) {
    return {
      eyebrow: 'Koniec rundy',
      title: `${getTeamLabel(assassinTeam)} trafili zabójcę.`,
      description: 'Możesz przygotować kolejną planszę albo zakończyć mecz.',
      tone: 'danger',
    }
  }

  if (phase === 'ended') {
    return {
      eyebrow: 'Koniec rundy',
      title: 'Runda została zakończona.',
      description: 'Wybierz kolejną planszę albo przejdź dalej do podsumowania.',
      tone: 'warning',
    }
  }

  return null
}

export function shouldWarnBeforeUnload(phase: RoomPhase) {
  return phase !== 'waiting'
}

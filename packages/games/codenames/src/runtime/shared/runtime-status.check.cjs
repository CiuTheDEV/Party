const assert = require('node:assert/strict')
const path = require('node:path')

const builtModulePath = process.argv[2]

if (!builtModulePath) {
  throw new Error('Expected compiled runtime status module path as first argument.')
}

const moduleUnderTest = require(path.resolve(process.cwd(), builtModulePath))

assert.equal(typeof moduleUnderTest.getCaptainRuntimeStatus, 'function')
assert.equal(typeof moduleUnderTest.getHostRuntimeStatus, 'function')

assert.deepEqual(
  moduleUnderTest.getCaptainRuntimeStatus({
    phase: 'ended',
    hostConnected: true,
    captainRedConnected: true,
    captainBlueConnected: true,
    captainRedReady: true,
    captainBlueReady: true,
    boardUnlocked: true,
    assassinTeam: 'blue',
    viewerTeam: 'red',
  }),
  {
    eyebrow: 'Koniec rundy',
    title: 'Niebiescy trafili zabojce.',
    description: 'Host przygotowuje kolejna plansze.',
    tone: 'danger',
  },
)

assert.deepEqual(
  moduleUnderTest.getCaptainRuntimeStatus({
    phase: 'playing',
    hostConnected: true,
    captainRedConnected: true,
    captainBlueConnected: false,
    captainRedReady: true,
    captainBlueReady: false,
    boardUnlocked: true,
    assassinTeam: null,
    viewerTeam: 'red',
  }),
  {
    eyebrow: 'Gra wstrzymana',
    title: 'Kapitan Niebieskich rozlaczyl sie.',
    description: 'Plansza wznowi sie automatycznie po ponownym polaczeniu.',
    tone: 'warning',
  },
)

assert.deepEqual(
  moduleUnderTest.getCaptainRuntimeStatus({
    phase: 'assassin-reveal',
    hostConnected: true,
    captainRedConnected: true,
    captainBlueConnected: true,
    captainRedReady: true,
    captainBlueReady: true,
    boardUnlocked: true,
    assassinTeam: null,
    viewerTeam: 'red',
  }),
  {
    eyebrow: 'Uwaga',
    title: 'Ktos trafil zabojce.',
    description: 'Czekam na decyzje hosta, kto odkryl karte.',
    tone: 'danger',
  },
)

assert.deepEqual(
  moduleUnderTest.getCaptainRuntimeStatus({
    phase: 'playing',
    hostConnected: true,
    captainRedConnected: true,
    captainBlueConnected: true,
    captainRedReady: false,
    captainBlueReady: false,
    boardUnlocked: false,
    assassinTeam: null,
    viewerTeam: 'red',
  }),
  {
    eyebrow: 'Przekaz urzadzenie',
    title: 'Potwierdz gotowosc nowego kapitana.',
    description: 'Klucz planszy odblokuje sie dopiero, gdy oboje kapitanowie klikna Gotowy.',
    tone: 'warning',
  },
)

assert.deepEqual(
  moduleUnderTest.getHostRuntimeStatus({
    phase: 'playing',
    captainRedConnected: false,
    captainBlueConnected: true,
    captainRedReady: false,
    captainBlueReady: false,
    boardUnlocked: false,
    assassinTeam: null,
  }),
  {
    eyebrow: 'Gra wstrzymana',
    title: 'Kapitan Czerwonych jest rozlaczony.',
    description: 'Parowanie pozostaje otwarte, dopoki oba urzadzenia nie wroca.',
    tone: 'warning',
  },
)

assert.deepEqual(
  moduleUnderTest.getHostRuntimeStatus({
    phase: 'playing',
    captainRedConnected: true,
    captainBlueConnected: true,
    captainRedReady: true,
    captainBlueReady: false,
    boardUnlocked: false,
    assassinTeam: null,
  }),
  {
    eyebrow: 'Oczekiwanie',
    title: 'Czekam na gotowosc kapitanow.',
    description: 'Gotowy: Czerwoni. Czeka: Niebiescy.',
    tone: 'warning',
  },
)

assert.equal(
  moduleUnderTest.shouldWarnBeforeUnload('playing'),
  true,
)
assert.equal(
  moduleUnderTest.shouldWarnBeforeUnload('ended'),
  true,
)
assert.equal(
  moduleUnderTest.shouldWarnBeforeUnload('waiting'),
  false,
)

console.log('Codenames runtime status helpers behave as expected.')

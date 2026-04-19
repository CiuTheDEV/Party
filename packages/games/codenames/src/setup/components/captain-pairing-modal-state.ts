export function shouldAutoCloseCaptainPairingModal(captainRedConnected: boolean, captainBlueConnected: boolean) {
  return captainRedConnected && captainBlueConnected
}

export function getCaptainPairingSummary(captainRedConnected: boolean, captainBlueConnected: boolean) {
  if (captainRedConnected && captainBlueConnected) {
    return 'Obaj kapitanowie są już połączeni. Zamykam parowanie.'
  }

  if (captainRedConnected) {
    return 'Kapitan Czerwonych już się połączył. Czekam na Kapitana Niebieskich.'
  }

  if (captainBlueConnected) {
    return 'Kapitan Niebieskich już się połączył. Czekam na Kapitana Czerwonych.'
  }

  return 'Czekam na połączenie obu kapitanów.'
}

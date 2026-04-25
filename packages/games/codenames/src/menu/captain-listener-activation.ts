type CaptainListenerActivationParams = {
  hasRestoredSetup: boolean
  roomId: string
}

export function shouldKeepCaptainListenerActive({
  hasRestoredSetup,
  roomId,
}: CaptainListenerActivationParams) {
  return hasRestoredSetup && roomId.trim().length > 0
}

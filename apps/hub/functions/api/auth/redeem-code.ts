import { redeemCodeFromRequest, type AuthEnv } from './_shared'

export const onRequestPost = async ({ request, env }: { request: Request; env: AuthEnv }) =>
  redeemCodeFromRequest(request, env)

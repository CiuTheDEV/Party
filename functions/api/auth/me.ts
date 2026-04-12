import { meFromRequest, type AuthEnv } from '../../../apps/hub/functions/api/auth/_shared'

export const onRequestGet = async ({ request, env }: { request: Request; env: AuthEnv }) =>
  meFromRequest(request, env)

import { registerFromRequest, type AuthEnv } from '../../../../apps/hub/functions/api/auth/_shared'

export const onRequestPost = async ({ request, env }: { request: Request; env: AuthEnv }) =>
  registerFromRequest(request, env)

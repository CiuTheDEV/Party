import { logoutFromRequest, type AuthEnv } from '../../../../apps/hub/functions/api/auth/_shared'

export const onRequestPost = async ({ request, env }: { request: Request; env: AuthEnv }) =>
  logoutFromRequest(request, env)

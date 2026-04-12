import { registerFromRequest, type AuthEnv } from './_shared'

export const onRequestPost = async ({ request, env }: { request: Request; env: AuthEnv }) =>
  registerFromRequest(request, env)

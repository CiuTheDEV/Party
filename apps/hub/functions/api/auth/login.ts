import { loginFromRequest, type AuthEnv } from './_shared'

export const onRequestPost = async ({ request, env }: { request: Request; env: AuthEnv }) =>
  loginFromRequest(request, env)

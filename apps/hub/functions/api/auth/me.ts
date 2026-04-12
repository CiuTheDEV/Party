import { meFromRequest, type AuthEnv } from './_shared'

export const onRequestGet = async ({ request, env }: { request: Request; env: AuthEnv }) =>
  meFromRequest(request, env)

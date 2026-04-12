import { listActivationCodesFromRequest, type AuthEnv } from '../../../../apps/hub/functions/api/auth/admin/admin-api'

export const onRequestGet = async ({ request, env }: { request: Request; env: AuthEnv }) =>
  listActivationCodesFromRequest(request, env)

import { listUsersFromRequest, type AuthEnv } from '../../../../apps/hub/functions/api/auth/admin/admin-api'

export const onRequestGet = async ({ request, env }: { request: Request; env: AuthEnv }) =>
  listUsersFromRequest(request, env)

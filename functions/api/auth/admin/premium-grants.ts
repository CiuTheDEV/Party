import {
  grantPremiumFromRequest,
  listPremiumGrantsFromRequest,
  revokePremiumFromRequest,
  type AuthEnv,
} from '../../../../apps/hub/functions/api/auth/admin/admin-api'

export const onRequestGet = async ({ request, env }: { request: Request; env: AuthEnv }) =>
  listPremiumGrantsFromRequest(request, env)

export const onRequestPost = async ({ request, env }: { request: Request; env: AuthEnv }) =>
  grantPremiumFromRequest(request, env)

export const onRequestDelete = async ({ request, env }: { request: Request; env: AuthEnv }) =>
  revokePremiumFromRequest(request, env)

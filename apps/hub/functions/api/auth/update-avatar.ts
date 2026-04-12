import { type AuthEnv, updateAvatarFromRequest } from './_shared'

export async function onRequestPost(context: { request: Request; env: AuthEnv }) {
  return updateAvatarFromRequest(context.request, context.env)
}

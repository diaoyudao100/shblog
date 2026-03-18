import { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { verifyJWT } from '../utils/jwt'
import { err } from '../utils/response'
import type { HonoEnv } from '../types'

export async function authMiddleware(c: Context<HonoEnv>, next: Next) {
  const token = getCookie(c, 'access_token') || c.req.header('Authorization')?.replace('Bearer ', '')
  if (!token) return err(c, '未登录', 401)
  const payload = await verifyJWT(token, c.env.JWT_SECRET)
  if (!payload) return err(c, 'Token 无效或已过期', 401)
  c.set('userId', payload.sub)
  c.set('userRole', payload.role)
  await next()
}

export async function adminMiddleware(c: Context<HonoEnv>, next: Next) {
  await authMiddleware(c, async () => {})
  if (c.get('userRole') !== 'admin') return err(c, '权限不足', 403)
  await next()
}

export function optionalAuth(secret: string) {
  return async (c: Context<HonoEnv>, next: Next) => {
    const token = getCookie(c, 'access_token') || c.req.header('Authorization')?.replace('Bearer ', '')
    if (token) {
      const payload = await verifyJWT(token, secret)
      if (payload) {
        c.set('userId', payload.sub)
        c.set('userRole', payload.role)
      }
    }
    await next()
  }
}

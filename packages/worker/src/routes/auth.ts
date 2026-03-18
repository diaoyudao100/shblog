import { Hono } from 'hono'
import { setCookie, deleteCookie } from 'hono/cookie'
import { hashPassword, verifyPassword } from '../utils/password'
import { signJWT } from '../utils/jwt'
import { ok, err } from '../utils/response'
import type { HonoEnv } from '../types'
import { authMiddleware } from '../middleware/auth'

const auth = new Hono<HonoEnv>()

const ACCESS_EXP = 60 * 15 // 15 min
const REFRESH_EXP = 60 * 60 * 24 * 30 // 30 days

auth.post('/register', async (c) => {
  const { username, email, password } = await c.req.json()
  if (!username || !email || !password) return err(c, '参数不完整')
  if (password.length < 8) return err(c, '密码至少8位')

  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email=? OR username=?')
    .bind(email, username).first()
  if (existing) return err(c, '用户名或邮箱已存在')

  const hash = await hashPassword(password)
  const result = await c.env.DB.prepare(
    'INSERT INTO users (username, email, password_hash) VALUES (?,?,?) RETURNING id, username, email, role'
  ).bind(username, email, hash).first() as any

  return ok(c, result, 201)
})

auth.post('/login', async (c) => {
  const { email, password } = await c.req.json()
  if (!email || !password) return err(c, '参数不完整')

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email=?').bind(email).first() as any
  if (!user) return err(c, '邮箱或密码错误', 401)
  if (user.banned) return err(c, '账号已被封禁', 403)

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) return err(c, '邮箱或密码错误', 401)

  const now = Math.floor(Date.now() / 1000)
  const accessToken = await signJWT({ sub: user.id, role: user.role, exp: now + ACCESS_EXP }, c.env.JWT_SECRET)
  const refreshToken = await signJWT({ sub: user.id, role: user.role, exp: now + REFRESH_EXP }, c.env.JWT_SECRET)

  // store refresh token hash
  const tokenHash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(refreshToken))))
    .map(b => b.toString(16).padStart(2, '0')).join('')
  const expiresAt = new Date((now + REFRESH_EXP) * 1000).toISOString()
  await c.env.DB.prepare('INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?,?,?)')
    .bind(user.id, tokenHash, expiresAt).run()

  setCookie(c, 'access_token', accessToken, { httpOnly: true, sameSite: 'Lax', path: '/', maxAge: ACCESS_EXP })
  setCookie(c, 'refresh_token', refreshToken, { httpOnly: true, sameSite: 'Lax', path: '/', maxAge: REFRESH_EXP })

  return ok(c, { id: user.id, username: user.username, email: user.email, role: user.role, avatar: user.avatar })
})

auth.post('/logout', async (c) => {
  deleteCookie(c, 'access_token', { path: '/' })
  deleteCookie(c, 'refresh_token', { path: '/' })
  return ok(c, null)
})

auth.post('/refresh', async (c) => {
  const { getCookie } = await import('hono/cookie')
  const { verifyJWT } = await import('../utils/jwt')
  const refreshToken = getCookie(c, 'refresh_token')
  if (!refreshToken) return err(c, '未登录', 401)

  const payload = await verifyJWT(refreshToken, c.env.JWT_SECRET)
  if (!payload) return err(c, 'Refresh token 无效', 401)

  const tokenHash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(refreshToken))))
    .map(b => b.toString(16).padStart(2, '0')).join('')
  const stored = await c.env.DB.prepare('SELECT id FROM refresh_tokens WHERE token_hash=? AND expires_at > datetime(\'now\')')
    .bind(tokenHash).first()
  if (!stored) return err(c, 'Refresh token 已失效', 401)

  // rotate
  await c.env.DB.prepare('DELETE FROM refresh_tokens WHERE token_hash=?').bind(tokenHash).run()

  const now = Math.floor(Date.now() / 1000)
  const accessToken = await signJWT({ sub: payload.sub, role: payload.role, exp: now + ACCESS_EXP }, c.env.JWT_SECRET)
  const newRefresh = await signJWT({ sub: payload.sub, role: payload.role, exp: now + REFRESH_EXP }, c.env.JWT_SECRET)
  const newHash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(newRefresh))))
    .map(b => b.toString(16).padStart(2, '0')).join('')
  await c.env.DB.prepare('INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?,?,?)')
    .bind(payload.sub, newHash, new Date((now + REFRESH_EXP) * 1000).toISOString()).run()

  setCookie(c, 'access_token', accessToken, { httpOnly: true, sameSite: 'Lax', path: '/', maxAge: ACCESS_EXP })
  setCookie(c, 'refresh_token', newRefresh, { httpOnly: true, sameSite: 'Lax', path: '/', maxAge: REFRESH_EXP })

  return ok(c, { refreshed: true })
})

auth.get('/me', authMiddleware, async (c) => {
  const user = await c.env.DB.prepare('SELECT id, username, email, role, avatar, bio, created_at FROM users WHERE id=?')
    .bind(c.get('userId')).first()
  if (!user) return err(c, '用户不存在', 404)
  return ok(c, user)
})

export default auth

import { Hono } from 'hono'
import { ok, err } from '../utils/response'
import { adminMiddleware } from '../middleware/auth'
import type { HonoEnv } from '../types'

const users = new Hono<HonoEnv>()

users.get('/', adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, username, email, role, avatar, banned, created_at FROM users ORDER BY created_at DESC'
  ).all()
  return ok(c, results)
})

users.put('/:id/ban', adminMiddleware, async (c) => {
  const id = Number(c.req.param('id'))
  const { banned } = await c.req.json()
  await c.env.DB.prepare('UPDATE users SET banned=? WHERE id=?').bind(banned ? 1 : 0, id).run()
  return ok(c, { updated: true })
})

export default users

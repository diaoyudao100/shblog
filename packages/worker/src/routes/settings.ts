import { Hono } from 'hono'
import { ok, err } from '../utils/response'
import { adminMiddleware } from '../middleware/auth'
import type { HonoEnv } from '../types'

const settings = new Hono<HonoEnv>()

// 公开：获取所有设置
settings.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT key, value FROM site_settings').all()
  const map: Record<string, string> = {}
  for (const row of results as any[]) map[row.key] = row.value
  return ok(c, map)
})

// 管理员：批量更新设置
settings.put('/', adminMiddleware, async (c) => {
  const body = await c.req.json() as Record<string, string>
  for (const [key, value] of Object.entries(body)) {
    await c.env.DB.prepare(
      `INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at`
    ).bind(key, value).run()
  }
  return ok(c, { saved: true })
})

export default settings

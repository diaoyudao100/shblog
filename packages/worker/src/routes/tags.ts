import { Hono } from 'hono'
import { ok, err } from '../utils/response'
import { adminMiddleware } from '../middleware/auth'
import type { HonoEnv } from '../types'

const tags = new Hono<HonoEnv>()

tags.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT t.*, COUNT(pt.post_id) as post_count
     FROM tags t LEFT JOIN post_tags pt ON t.id=pt.tag_id
     LEFT JOIN posts p ON pt.post_id=p.id AND p.status='published'
     GROUP BY t.id ORDER BY post_count DESC`
  ).all()
  return ok(c, results)
})

tags.post('/', adminMiddleware, async (c) => {
  const { name, slug } = await c.req.json()
  if (!name || !slug) return err(c, '缺少必要字段')
  const result = await c.env.DB.prepare(
    'INSERT INTO tags (name, slug) VALUES (?,?) RETURNING *'
  ).bind(name, slug).first()
  return ok(c, result, 201)
})

tags.put('/:id', adminMiddleware, async (c) => {
  const id = Number(c.req.param('id'))
  const { name, slug } = await c.req.json()
  await c.env.DB.prepare('UPDATE tags SET name=?, slug=? WHERE id=?').bind(name, slug, id).run()
  return ok(c, { updated: true })
})

tags.delete('/:id', adminMiddleware, async (c) => {
  const id = Number(c.req.param('id'))
  await c.env.DB.prepare('DELETE FROM tags WHERE id=?').bind(id).run()
  return ok(c, { deleted: true })
})

export default tags

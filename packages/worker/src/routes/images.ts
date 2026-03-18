import { Hono } from 'hono'
import { ok, err } from '../utils/response'
import { adminMiddleware } from '../middleware/auth'
import type { HonoEnv } from '../types'

const images = new Hono<HonoEnv>()

images.post('/presign', adminMiddleware, async (c) => {
  const { filename, mime_type } = await c.req.json()
  if (!filename || !mime_type) return err(c, '缺少必要字段')

  const ext = filename.split('.').pop()
  const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  // R2 不原生支持预签名，返回 key 让前端直传后通知后端登记
  // 实际上传用 PUT /images/upload/:key 由 Worker 代理
  return ok(c, { key, upload_url: `/api/v1/images/upload` })
})

images.put('/upload', adminMiddleware, async (c) => {
  const key = c.req.query('key')
  if (!key) return err(c, '缺少 key')
  const body = await c.req.arrayBuffer()
  const contentType = c.req.header('Content-Type') || 'application/octet-stream'
  await c.env.IMAGES.put(key, body, { httpMetadata: { contentType } })

  const url = `https://images.yourdomain.com/${key}`
  const filename = key.split('/').pop() || key
  await c.env.DB.prepare(
    'INSERT INTO images (key, url, filename, size, mime_type, uploader_id) VALUES (?,?,?,?,?,?)'
  ).bind(key, url, filename, body.byteLength, contentType, c.get('userId')).run()

  return ok(c, { key, url }, 201)
})

images.get('/', adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM images ORDER BY created_at DESC LIMIT 100'
  ).all()
  return ok(c, results)
})

images.delete('/:id', adminMiddleware, async (c) => {
  const id = Number(c.req.param('id'))
  const image = await c.env.DB.prepare('SELECT key FROM images WHERE id=?').bind(id).first() as any
  if (!image) return err(c, '图片不存在', 404)
  await c.env.IMAGES.delete(image.key)
  await c.env.DB.prepare('DELETE FROM images WHERE id=?').bind(id).run()
  return ok(c, { deleted: true })
})

export default images

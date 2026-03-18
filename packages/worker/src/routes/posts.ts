import { Hono } from 'hono'
import { ok, err } from '../utils/response'
import { authMiddleware, adminMiddleware } from '../middleware/auth'
import type { HonoEnv } from '../types'

const posts = new Hono<HonoEnv>()

posts.get('/', async (c) => {
  const page = Number(c.req.query('page') || 1)
  const limit = Number(c.req.query('limit') || 10)
  const offset = (page - 1) * limit
  const status = c.req.query('status') || 'published'
  const category = c.req.query('category')
  const tag = c.req.query('tag')

  let query = `SELECT p.id, p.title, p.slug, p.excerpt, p.cover_image, p.status,
    p.category, p.view_count, p.published_at, p.created_at,
    u.username as author_name, u.avatar as author_avatar
    FROM posts p LEFT JOIN users u ON p.author_id = u.id
    WHERE p.status = ?`
  const params: unknown[] = [status]

  if (category) { query += ' AND p.category = ?'; params.push(category) }
  if (tag) {
    query += ' AND p.id IN (SELECT pt.post_id FROM post_tags pt JOIN tags t ON pt.tag_id=t.id WHERE t.slug=?)'
    params.push(tag)
  }
  query += ' ORDER BY p.published_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)

  const { results } = await c.env.DB.prepare(query).bind(...params).all()

  const countQuery = `SELECT COUNT(*) as total FROM posts p WHERE p.status = ?`
  const countResult = await c.env.DB.prepare(countQuery).bind(status).first() as any

  // attach tags for each post
  for (const post of results as any[]) {
    const { results: tags } = await c.env.DB.prepare(
      'SELECT t.name, t.slug FROM tags t JOIN post_tags pt ON t.id=pt.tag_id WHERE pt.post_id=?'
    ).bind(post.id).all()
    post.tags = tags
  }

  return ok(c, { posts: results, total: countResult?.total || 0, page, limit })
})

posts.get('/:slug', async (c) => {
  const slug = c.req.param('slug')
  const post = await c.env.DB.prepare(
    `SELECT p.*, u.username as author_name, u.avatar as author_avatar, u.bio as author_bio
     FROM posts p LEFT JOIN users u ON p.author_id=u.id
     WHERE p.slug=? AND p.status='published'`
  ).bind(slug).first() as any
  if (!post) return err(c, '文章不存在', 404)

  // increment view count
  await c.env.DB.prepare('UPDATE posts SET view_count=view_count+1 WHERE id=?').bind(post.id).run()

  const { results: tags } = await c.env.DB.prepare(
    'SELECT t.name, t.slug FROM tags t JOIN post_tags pt ON t.id=pt.tag_id WHERE pt.post_id=?'
  ).bind(post.id).all()
  post.tags = tags

  return ok(c, post)
})

posts.post('/', adminMiddleware, async (c) => {
  const body = await c.req.json()
  const { title, slug, content, excerpt, cover_image, status, category, tags } = body
  if (!title || !slug || !content) return err(c, '缺少必要字段')

  const result = await c.env.DB.prepare(
    `INSERT INTO posts (title, slug, content, excerpt, cover_image, status, category, author_id, published_at)
     VALUES (?,?,?,?,?,?,?,?,?) RETURNING id`
  ).bind(
    title, slug, content, excerpt || null, cover_image || null,
    status || 'draft', category || 'essay', c.get('userId'),
    status === 'published' ? new Date().toISOString() : null
  ).first() as any

  if (tags?.length) {
    for (const tagId of tags) {
      await c.env.DB.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?,?)').bind(result.id, tagId).run()
    }
  }

  return ok(c, { id: result.id }, 201)
})

posts.put('/:id', adminMiddleware, async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  const { title, slug, content, excerpt, cover_image, status, category, tags } = body

  const existing = await c.env.DB.prepare('SELECT id, status FROM posts WHERE id=?').bind(id).first() as any
  if (!existing) return err(c, '文章不存在', 404)

  const publishedAt = status === 'published' && existing.status !== 'published'
    ? new Date().toISOString() : undefined

  await c.env.DB.prepare(
    `UPDATE posts SET title=?, slug=?, content=?, excerpt=?, cover_image=?, status=?, category=?,
     updated_at=datetime('now') ${publishedAt ? ', published_at=?' : ''} WHERE id=?`
  ).bind(
    title, slug, content, excerpt || null, cover_image || null, status, category,
    ...(publishedAt ? [publishedAt] : []), id
  ).run()

  if (tags !== undefined) {
    await c.env.DB.prepare('DELETE FROM post_tags WHERE post_id=?').bind(id).run()
    for (const tagId of tags) {
      await c.env.DB.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?,?)').bind(id, tagId).run()
    }
  }

  return ok(c, { updated: true })
})

posts.delete('/:id', adminMiddleware, async (c) => {
  const id = Number(c.req.param('id'))
  const existing = await c.env.DB.prepare('SELECT id FROM posts WHERE id=?').bind(id).first()
  if (!existing) return err(c, '文章不存在', 404)
  await c.env.DB.prepare('DELETE FROM posts WHERE id=?').bind(id).run()
  return ok(c, { deleted: true })
})

export default posts

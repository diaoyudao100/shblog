import { Hono } from 'hono'
import { ok, err } from '../utils/response'
import { authMiddleware, adminMiddleware } from '../middleware/auth'
import type { HonoEnv } from '../types'

const comments = new Hono<HonoEnv>()

// 公开：获取文章已审核评论
comments.get('/posts/:postId/comments', async (c) => {
  const postId = Number(c.req.param('postId'))
  const { results } = await c.env.DB.prepare(
    `SELECT c.id, c.content, c.parent_id, c.created_at,
     c.guest_name, u.username, u.avatar
     FROM comments c LEFT JOIN users u ON c.user_id=u.id
     WHERE c.post_id=? AND c.status='approved'
     ORDER BY c.created_at ASC`
  ).bind(postId).all()
  return ok(c, results)
})

// 提交评论（登录或匿名）
comments.post('/posts/:postId/comments', async (c) => {
  const postId = Number(c.req.param('postId'))
  const post = await c.env.DB.prepare("SELECT id FROM posts WHERE id=? AND status='published'").bind(postId).first()
  if (!post) return err(c, '文章不存在', 404)

  const { content, guest_name, guest_email, parent_id } = await c.req.json()
  if (!content?.trim()) return err(c, '评论内容不能为空')

  // 从 cookie 中获取用户 ID（可选）
  const { getCookie } = await import('hono/cookie')
  const { verifyJWT } = await import('../utils/jwt')
  const token = getCookie(c, 'access_token')
  let userId: number | null = null
  if (token) {
    const payload = await verifyJWT(token, c.env.JWT_SECRET)
    if (payload) userId = payload.sub
  }

  if (!userId && (!guest_name?.trim() || !guest_email?.trim())) {
    return err(c, '匿名评论需提供昵称和邮箱')
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO comments (post_id, user_id, guest_name, guest_email, content, parent_id)
     VALUES (?,?,?,?,?,?) RETURNING id`
  ).bind(postId, userId, guest_name || null, guest_email || null, content.trim(), parent_id || null).first() as any

  return ok(c, { id: result.id, status: 'pending', message: '评论已提交，等待审核' }, 201)
})

// 管理员：所有评论
comments.get('/admin/comments', adminMiddleware, async (c) => {
  const page = Number(c.req.query('page') || 1)
  const limit = Number(c.req.query('limit') || 20)
  const offset = (page - 1) * limit
  const status = c.req.query('status')

  let query = `SELECT c.*, p.title as post_title, u.username
    FROM comments c LEFT JOIN posts p ON c.post_id=p.id
    LEFT JOIN users u ON c.user_id=u.id`
  const params: unknown[] = []
  if (status) { query += ' WHERE c.status=?'; params.push(status) }
  query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)

  const { results } = await c.env.DB.prepare(query).bind(...params).all()
  return ok(c, results)
})

comments.put('/admin/comments/:id/approve', adminMiddleware, async (c) => {
  const id = Number(c.req.param('id'))
  await c.env.DB.prepare("UPDATE comments SET status='approved' WHERE id=?").bind(id).run()
  return ok(c, { approved: true })
})

comments.put('/admin/comments/:id/reject', adminMiddleware, async (c) => {
  const id = Number(c.req.param('id'))
  await c.env.DB.prepare("UPDATE comments SET status='rejected' WHERE id=?").bind(id).run()
  return ok(c, { rejected: true })
})

comments.delete('/admin/comments/:id', adminMiddleware, async (c) => {
  const id = Number(c.req.param('id'))
  await c.env.DB.prepare('DELETE FROM comments WHERE id=?').bind(id).run()
  return ok(c, { deleted: true })
})

export default comments

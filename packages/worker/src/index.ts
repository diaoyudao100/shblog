import { Hono } from 'hono'
import { corsMiddleware } from './middleware/cors'
import auth from './routes/auth'
import posts from './routes/posts'
import tags from './routes/tags'
import comments from './routes/comments'
import images from './routes/images'
import users from './routes/users'
import feed from './routes/feed'
import type { HonoEnv } from './types'

import settings from './routes/settings'

const app = new Hono<HonoEnv>()

// CORS
app.use('*', async (c, next) => {
  const middleware = corsMiddleware(c.env.FRONTEND_URL)
  return middleware(c, next)
})

// Routes
const api = new Hono<HonoEnv>()
api.route('/auth', auth)
api.route('/posts', posts)
api.route('/tags', tags)
api.route('/', comments)   // /posts/:postId/comments + /admin/comments
api.route('/images', images)
api.route('/settings', settings)
api.route('/admin/users', users)

app.route('/api/v1', api)
app.route('/', feed)

app.notFound((c) => c.json({ success: false, message: 'Not Found' }, 404))
app.onError((err, c) => {
  console.error(err)
  return c.json({ success: false, message: 'Internal Server Error' }, 500)
})

export default app

import { Context, Next } from 'hono'
import type { HonoEnv } from '../types'

export function corsMiddleware(_frontendUrl: string) {
  return async (c: Context<HonoEnv>, next: Next) => {
    const origin = c.req.header('Origin') || ''
    const allowed = [
      'https://shblog.pages.dev',
      'http://localhost:5173',
    ]
    if (allowed.includes(origin)) {
      c.header('Access-Control-Allow-Origin', origin)
      c.header('Access-Control-Allow-Credentials', 'true')
    } else {
      c.header('Access-Control-Allow-Origin', '*')
    }
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    c.header('Access-Control-Max-Age', '86400')

    if (c.req.method === 'OPTIONS') {
      return new Response(null, { status: 204 })
    }
    await next()
  }
}

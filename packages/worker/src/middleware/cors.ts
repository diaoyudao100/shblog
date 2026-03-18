import { Context, Next } from 'hono'
import { cors } from 'hono/cors'
import type { HonoEnv } from '../types'

export function corsMiddleware(frontendUrl: string) {
  return cors({
    origin: [frontendUrl, 'http://localhost:5173', 'https://shblog.pages.dev'],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    maxAge: 86400,
  })
}

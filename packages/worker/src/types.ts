import { Hono } from 'hono'
import type { D1Database, R2Bucket, KVNamespace } from '@cloudflare/workers-types'

export type Env = {
  DB: D1Database
  IMAGES: R2Bucket
  CACHE: KVNamespace
  JWT_SECRET: string
  FRONTEND_URL: string
}

export type HonoEnv = { Bindings: Env; Variables: { userId: number; userRole: string } }

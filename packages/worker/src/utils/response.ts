import { Context } from 'hono'

export function ok(c: Context, data: unknown, status = 200) {
  return c.json({ success: true, data }, status as any)
}

export function err(c: Context, message: string, status = 400) {
  return c.json({ success: false, message }, status as any)
}

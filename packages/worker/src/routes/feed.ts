import { Hono } from 'hono'
import type { HonoEnv } from '../types'

const feed = new Hono<HonoEnv>()

feed.get('/feed.xml', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT title, slug, excerpt, published_at FROM posts WHERE status='published' ORDER BY published_at DESC LIMIT 20`
  ).all() as { results: any[] }

  const siteUrl = c.env.FRONTEND_URL
  const items = results.map((p: any) => `
  <item>
    <title><![CDATA[${p.title}]]></title>
    <link>${siteUrl}/posts/${p.slug}</link>
    <guid>${siteUrl}/posts/${p.slug}</guid>
    <pubDate>${new Date(p.published_at).toUTCString()}</pubDate>
    ${p.excerpt ? `<description><![CDATA[${p.excerpt}]]></description>` : ''}
  </item>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>shblog</title>
  <link>${siteUrl}</link>
  <description>个人博客 - 生活随笔、旅行、摄影</description>
  <language>zh-CN</language>
  ${items}
</channel>
</rss>`

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
})

export default feed

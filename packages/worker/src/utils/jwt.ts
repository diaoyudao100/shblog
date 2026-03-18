export interface JWTPayload {
  sub: number
  role: string
  exp: number
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function b64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function parseB64url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0))
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function signJWT(payload: JWTPayload, secret: string): Promise<string> {
  const header = b64url(encoder.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))
  const body = b64url(encoder.encode(JSON.stringify(payload)))
  const key = await getKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(`${header}.${body}`))
  return `${header}.${body}.${b64url(sig)}`
}

export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [header, body, sig] = parts
    const key = await getKey(secret)
    const valid = await crypto.subtle.verify(
      'HMAC', key,
      parseB64url(sig),
      encoder.encode(`${header}.${body}`)
    )
    if (!valid) return null
    const payload: JWTPayload = JSON.parse(decoder.decode(parseB64url(body)))
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

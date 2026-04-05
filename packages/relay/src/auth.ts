import jwt from 'jsonwebtoken'
import type { RelayConfig } from './types.js'

export type AuthResult =
  | { ok: true; userId: string | undefined }
  | { ok: false; reason: string }

/**
 * Verify a client-supplied token.
 *
 * Strategy:
 * 1. If JWT_SECRET is set, verify as a JWT.
 * 2. If AUTH_WEBHOOK is set, POST to the webhook and trust the response.
 * 3. If neither is set, accept all connections (open relay — dev mode).
 */
export async function verifyToken(
  token: string | undefined,
  appId: string,
  config: RelayConfig,
): Promise<AuthResult> {
  // Dev mode — no auth configured
  if (!config.jwtSecret && !config.authWebhook) {
    return { ok: true, userId: undefined }
  }

  if (!token) {
    return { ok: false, reason: 'No token provided' }
  }

  // JWT verification
  if (config.jwtSecret) {
    try {
      const payload = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload
      return { ok: true, userId: typeof payload['sub'] === 'string' ? payload['sub'] : undefined }
    } catch (err) {
      return { ok: false, reason: err instanceof Error ? err.message : 'Invalid token' }
    }
  }

  // Webhook verification
  if (config.authWebhook) {
    try {
      const res = await fetch(config.authWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, appId }),
      })
      if (!res.ok) {
        return { ok: false, reason: `Auth webhook returned ${res.status}` }
      }
      const body = (await res.json()) as { userId?: string }
      return { ok: true, userId: body.userId }
    } catch (err) {
      return { ok: false, reason: err instanceof Error ? err.message : 'Auth webhook failed' }
    }
  }

  return { ok: false, reason: 'Authentication failed' }
}

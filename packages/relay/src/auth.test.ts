import { describe, it, expect } from 'vitest'
import { verifyToken } from './auth.js'
import jwt from 'jsonwebtoken'
import type { RelayConfig } from './types.js'

function config(overrides: Partial<RelayConfig> = {}): RelayConfig {
  return {
    port: 8080,
    databasePath: ':memory:',
    jwtSecret: undefined,
    authWebhook: undefined,
    maxPayloadBytes: 1_048_576,
    logLevel: 'error',
    corsOrigins: '*',
    ...overrides,
  }
}

describe('verifyToken', () => {
  it('accepts any connection when no auth is configured (dev mode)', async () => {
    const result = await verifyToken(undefined, 'app1', config())
    expect(result.ok).toBe(true)
  })

  it('rejects when JWT_SECRET is set but no token provided', async () => {
    const result = await verifyToken(undefined, 'app1', config({ jwtSecret: 'secret' }))
    expect(result.ok).toBe(false)
  })

  it('accepts a valid JWT', async () => {
    const token = jwt.sign({ sub: 'user-123' }, 'my-secret', { expiresIn: '1h' })
    const result = await verifyToken(token, 'app1', config({ jwtSecret: 'my-secret' }))
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.userId).toBe('user-123')
  })

  it('rejects an invalid JWT', async () => {
    const result = await verifyToken('bad-token', 'app1', config({ jwtSecret: 'my-secret' }))
    expect(result.ok).toBe(false)
  })

  it('rejects an expired JWT', async () => {
    const token = jwt.sign({ sub: 'user-123' }, 'secret', { expiresIn: '-1s' })
    const result = await verifyToken(token, 'app1', config({ jwtSecret: 'secret' }))
    expect(result.ok).toBe(false)
  })
})

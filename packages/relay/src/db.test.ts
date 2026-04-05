import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { RelayDB } from './db.js'
import type { Operation } from './types.js'
import { randomUUID } from 'crypto'
import { unlinkSync, existsSync } from 'fs'

function op(overrides: Partial<Operation & { id?: string }> = {}): Operation {
  return {
    id: randomUUID(),
    type: 'set',
    key: 'note:1',
    value: { title: 'Hello' },
    timestamp: 1,
    deviceId: 'dev-a',
    synced: false,
    ...overrides,
  }
}

const DB_PATH = './test-relay.db'

describe('RelayDB', () => {
  let db: RelayDB

  beforeEach(() => {
    db = new RelayDB(DB_PATH)
  })

  afterEach(() => {
    db.close()
    if (existsSync(DB_PATH)) unlinkSync(DB_PATH)
    if (existsSync(`${DB_PATH}-shm`)) unlinkSync(`${DB_PATH}-shm`)
    if (existsSync(`${DB_PATH}-wal`)) unlinkSync(`${DB_PATH}-wal`)
  })

  it('saves and retrieves operations since a timestamp', () => {
    db.saveOperation('app1', op({ id: 'a', timestamp: 1 }))
    db.saveOperation('app1', op({ id: 'b', timestamp: 2 }))
    db.saveOperation('app1', op({ id: 'c', timestamp: 3 }))

    const ops = db.getOperationsSince('app1', 1)
    expect(ops.map((o) => o.id)).toEqual(expect.arrayContaining(['b', 'c']))
    expect(ops.find((o) => o.id === 'a')).toBeUndefined()
  })

  it('is idempotent — duplicate ops are silently ignored', () => {
    const o = op({ id: 'dup', timestamp: 5 })
    db.saveOperation('app1', o)
    db.saveOperation('app1', o) // no error
    const ops = db.getOperationsSince('app1', 0)
    expect(ops.filter((x) => x.id === 'dup')).toHaveLength(1)
  })

  it('isolates ops by appId', () => {
    db.saveOperation('app1', op({ id: 'x', timestamp: 1 }))
    db.saveOperation('app2', op({ id: 'y', timestamp: 1 }))

    const app1Ops = db.getOperationsSince('app1', 0)
    expect(app1Ops.every((o) => o.id === 'x')).toBe(true)
  })

  it('getLatestTimestamp returns 0 when no ops', () => {
    expect(db.getLatestTimestamp('empty-app')).toBe(0)
  })

  it('getLatestTimestamp returns the highest timestamp', () => {
    db.saveOperation('app1', op({ id: '1', timestamp: 10 }))
    db.saveOperation('app1', op({ id: '2', timestamp: 5 }))
    expect(db.getLatestTimestamp('app1')).toBe(10)
  })

  it('getOperationCount returns correct count', () => {
    db.saveOperation('app1', op({ id: '1', timestamp: 1 }))
    db.saveOperation('app1', op({ id: '2', timestamp: 2 }))
    expect(db.getOperationCount('app1')).toBe(2)
  })
})

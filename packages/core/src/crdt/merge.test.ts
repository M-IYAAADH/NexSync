import { describe, it, expect } from 'vitest'
import { resolveConflict, reduceOperations, advanceClock } from './merge.js'
import type { Operation } from '../types.js'

function makeOp(overrides: Partial<Operation>): Operation {
  return {
    id: 'op-1',
    type: 'set',
    key: 'note:1',
    value: { title: 'Hello' },
    timestamp: 1,
    deviceId: 'device-a',
    synced: false,
    ...overrides,
  }
}

describe('resolveConflict', () => {
  it('delete wins over set', () => {
    const del = makeOp({ id: 'del', type: 'delete', value: undefined, timestamp: 1 })
    const set = makeOp({ id: 'set', type: 'set', timestamp: 5 })
    expect(resolveConflict(del, set)).toBe(del)
    expect(resolveConflict(set, del)).toBe(del)
  })

  it('higher timestamp wins (LWW)', () => {
    const older = makeOp({ id: 'old', timestamp: 1 })
    const newer = makeOp({ id: 'new', timestamp: 2 })
    expect(resolveConflict(older, newer)).toBe(newer)
    expect(resolveConflict(newer, older)).toBe(newer)
  })

  it('ties broken by deviceId (lexicographic, higher wins)', () => {
    const a = makeOp({ id: 'a', timestamp: 5, deviceId: 'device-a' })
    const b = makeOp({ id: 'b', timestamp: 5, deviceId: 'device-b' })
    expect(resolveConflict(a, b)).toBe(b) // 'device-b' > 'device-a'
    expect(resolveConflict(b, a)).toBe(b)
  })

  it('both deletes — returns first arg (both equivalent)', () => {
    const d1 = makeOp({ id: 'd1', type: 'delete', timestamp: 1 })
    const d2 = makeOp({ id: 'd2', type: 'delete', timestamp: 2 })
    // delete vs delete: falls through to LWW — higher ts wins
    expect(resolveConflict(d1, d2)).toBe(d2)
  })
})

describe('reduceOperations', () => {
  it('returns null for empty array', () => {
    expect(reduceOperations([])).toBeNull()
  })

  it('returns single op unchanged', () => {
    const op = makeOp({})
    expect(reduceOperations([op])).toBe(op)
  })

  it('three-way concurrent edit — highest timestamp wins', () => {
    const ops = [
      makeOp({ id: '1', timestamp: 3, deviceId: 'a' }),
      makeOp({ id: '2', timestamp: 5, deviceId: 'b' }),
      makeOp({ id: '3', timestamp: 4, deviceId: 'c' }),
    ]
    expect(reduceOperations(ops)?.id).toBe('2')
  })

  it('delete wins over all concurrent sets', () => {
    const ops = [
      makeOp({ id: 'set1', type: 'set', timestamp: 10 }),
      makeOp({ id: 'del', type: 'delete', timestamp: 1, value: undefined }),
      makeOp({ id: 'set2', type: 'set', timestamp: 8 }),
    ]
    expect(reduceOperations(ops)?.type).toBe('delete')
  })

  it('extended offline period — last write before offline wins after merge', () => {
    const onlineOp = makeOp({ id: 'online', timestamp: 100, deviceId: 'server' })
    const offlineOp = makeOp({ id: 'offline', timestamp: 50, deviceId: 'client' })
    // online op is newer — it wins
    expect(reduceOperations([onlineOp, offlineOp])?.id).toBe('online')
  })
})

describe('advanceClock', () => {
  it('advances past the received clock', () => {
    expect(advanceClock(3, 10)).toBe(11)
  })

  it('advances past local clock when local is higher', () => {
    expect(advanceClock(20, 5)).toBe(21)
  })

  it('increments by 1 when equal', () => {
    expect(advanceClock(5, 5)).toBe(6)
  })
})

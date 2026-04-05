import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryStore } from './MemoryStore.js'
import type { Operation } from '../types.js'

function op(overrides: Partial<Operation> = {}): Operation {
  return {
    id: 'op-1',
    type: 'set',
    key: 'note:1',
    value: { title: 'Test' },
    timestamp: 1,
    deviceId: 'dev-a',
    synced: false,
    ...overrides,
  }
}

describe('MemoryStore', () => {
  let store: MemoryStore

  beforeEach(() => {
    store = new MemoryStore()
  })

  it('getValue returns null for missing key', async () => {
    expect(await store.getValue('missing')).toBeNull()
  })

  it('setValue and getValue round-trip', async () => {
    await store.setValue('note:1', { title: 'Hello' })
    expect(await store.getValue('note:1')).toEqual({ title: 'Hello' })
  })

  it('deleteValue removes a key', async () => {
    await store.setValue('note:1', { title: 'Hello' })
    await store.deleteValue('note:1')
    expect(await store.getValue('note:1')).toBeNull()
  })

  it('queryValues filters by prefix', async () => {
    await store.setValue('note:1', { title: 'A' })
    await store.setValue('note:2', { title: 'B' })
    await store.setValue('other:1', { title: 'C' })
    const result = await store.queryValues('note:')
    expect(Object.keys(result)).toEqual(expect.arrayContaining(['note:1', 'note:2']))
    expect(Object.keys(result)).not.toContain('other:1')
  })

  it('getPendingOperations returns only unsynced ops', async () => {
    await store.addOperation(op({ id: 'a', synced: false }))
    await store.addOperation(op({ id: 'b', synced: true }))
    const pending = await store.getPendingOperations()
    expect(pending).toHaveLength(1)
    expect(pending[0]?.id).toBe('a')
  })

  it('markOperationSynced marks an op as synced', async () => {
    await store.addOperation(op({ id: 'x', synced: false }))
    await store.markOperationSynced('x')
    const pending = await store.getPendingOperations()
    expect(pending).toHaveLength(0)
  })

  it('getOperationsForKey returns ops for a specific key', async () => {
    await store.addOperation(op({ id: 'a', key: 'note:1' }))
    await store.addOperation(op({ id: 'b', key: 'note:2' }))
    const ops = await store.getOperationsForKey('note:1')
    expect(ops).toHaveLength(1)
    expect(ops[0]?.id).toBe('a')
  })
})

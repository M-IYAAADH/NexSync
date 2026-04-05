import { describe, it, expect, beforeEach } from 'vitest'
import { OperationQueue } from './OperationQueue.js'
import { MemoryStore } from '../store/MemoryStore.js'
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

describe('OperationQueue', () => {
  let queue: OperationQueue

  beforeEach(() => {
    queue = new OperationQueue(new MemoryStore())
  })

  it('enqueues and returns pending ops sorted oldest-first', async () => {
    await queue.enqueue(op({ id: 'b', timestamp: 5 }))
    await queue.enqueue(op({ id: 'a', timestamp: 2 }))
    const pending = await queue.getPending()
    expect(pending.map((o) => o.id)).toEqual(['a', 'b'])
  })

  it('markSynced removes op from pending', async () => {
    await queue.enqueue(op({ id: 'x' }))
    await queue.markSynced('x')
    expect(await queue.pendingCount()).toBe(0)
  })

  it('pendingCount reflects unsynced ops', async () => {
    await queue.enqueue(op({ id: '1' }))
    await queue.enqueue(op({ id: '2' }))
    expect(await queue.pendingCount()).toBe(2)
    await queue.markSynced('1')
    expect(await queue.pendingCount()).toBe(1)
  })

  it('queue persists across flush cycles', async () => {
    await queue.enqueue(op({ id: 'persist' }))
    // Simulate: send ops, but relay hasn't confirmed yet
    const pending = await queue.getPending()
    expect(pending).toHaveLength(1)
    // Still pending — relay hasn't confirmed
    expect(await queue.pendingCount()).toBe(1)
    // Relay confirms
    await queue.markSynced('persist')
    expect(await queue.pendingCount()).toBe(0)
  })
})

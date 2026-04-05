import type { LocalStore, Operation } from '../types.js'

/**
 * Manages the offline operation queue.
 *
 * Writes are stored locally immediately. When the WebSocket connects,
 * flush() sends all pending operations to the relay oldest-first.
 * Operations stay in the queue until the relay confirms them (markSynced).
 */
export class OperationQueue {
  constructor(private store: LocalStore) {}

  /** Add an operation to the persistent queue. */
  async enqueue(op: Operation): Promise<void> {
    await this.store.addOperation(op)
  }

  /** Return all unsynced operations sorted oldest-first. */
  async getPending(): Promise<Operation[]> {
    const ops = await this.store.getPendingOperations()
    return ops.slice().sort((a, b) => a.timestamp - b.timestamp)
  }

  /** Mark an operation as confirmed by the relay. */
  async markSynced(id: string): Promise<void> {
    await this.store.markOperationSynced(id)
  }

  /** Return the count of unsynced operations. */
  async pendingCount(): Promise<number> {
    const ops = await this.store.getPendingOperations()
    return ops.length
  }
}

import type { LocalStore, Operation } from '../types.js'

/**
 * In-memory store. Data is lost on page reload / process exit.
 * Used as the default in test environments and as a fallback.
 */
export class MemoryStore implements LocalStore {
  private values = new Map<string, Record<string, unknown>>()
  private ops = new Map<string, Operation>() // keyed by op.id

  async getValue(key: string): Promise<Record<string, unknown> | null> {
    return this.values.get(key) ?? null
  }

  async setValue(key: string, value: Record<string, unknown>): Promise<void> {
    this.values.set(key, value)
  }

  async deleteValue(key: string): Promise<void> {
    this.values.delete(key)
  }

  async queryValues(prefix: string): Promise<Record<string, Record<string, unknown>>> {
    const result: Record<string, Record<string, unknown>> = {}
    for (const [k, v] of this.values) {
      if (k.startsWith(prefix)) {
        result[k] = v
      }
    }
    return result
  }

  async addOperation(op: Operation): Promise<void> {
    this.ops.set(op.id, op)
  }

  async getPendingOperations(): Promise<Operation[]> {
    return [...this.ops.values()].filter((op) => !op.synced)
  }

  async markOperationSynced(id: string): Promise<void> {
    const op = this.ops.get(id)
    if (op) {
      this.ops.set(id, { ...op, synced: true })
    }
  }

  async getOperationsForKey(key: string): Promise<Operation[]> {
    return [...this.ops.values()].filter((op) => op.key === key)
  }
}

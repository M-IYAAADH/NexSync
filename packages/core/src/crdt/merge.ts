import type { Operation } from '../types.js'

/**
 * Resolve a conflict between two operations for the same key.
 *
 * Rules (matching spec §4):
 * 1. Delete always wins over a concurrent set.
 * 2. Higher Lamport timestamp wins (Last-Write-Wins).
 * 3. On timestamp tie: higher deviceId wins (deterministic lexicographic tiebreak).
 */
export function resolveConflict(a: Operation, b: Operation): Operation {
  // Rule 1: delete wins
  if (a.type === 'delete' && b.type === 'set') return a
  if (b.type === 'delete' && a.type === 'set') return b

  // Rule 2: higher timestamp wins
  if (a.timestamp > b.timestamp) return a
  if (b.timestamp > a.timestamp) return b

  // Rule 3: deterministic tiebreak
  return a.deviceId >= b.deviceId ? a : b
}

/**
 * Given a list of all operations for a single key, reduce them to the winning operation.
 * Returns null if no operations exist.
 */
export function reduceOperations(ops: Operation[]): Operation | null {
  if (ops.length === 0) return null
  return ops.reduce((winner, op) => resolveConflict(winner, op))
}

/**
 * Advance a Lamport clock: take the max of local and received, then increment.
 */
export function advanceClock(local: number, received: number): number {
  return Math.max(local, received) + 1
}

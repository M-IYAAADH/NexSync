'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Synclite } from '@synclite/core'
import type { SyncliteConfig } from '@synclite/core'

// ── Context ────────────────────────────────────────────────────────────────────

const SyncliteContext = createContext<Synclite | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

export type SyncliteProviderProps = SyncliteConfig & {
  children: React.ReactNode
}

/**
 * Wrap your app (or a section of it) with this provider.
 * All `useSynclite`, `useValue`, `useQuery`, and `useStatus` hooks
 * must be rendered inside a `SyncliteProvider`.
 *
 * @example
 * ```tsx
 * <SyncliteProvider relay="wss://relay.example.com" userId="user-1">
 *   <App />
 * </SyncliteProvider>
 * ```
 */
export function SyncliteProvider({ children, ...config }: SyncliteProviderProps) {
  // useState initializer runs exactly once per mount, even in Strict Mode.
  const [db] = useState(() => new Synclite(config))

  useEffect(() => {
    // Disconnect when the provider unmounts
    return () => {
      db.disconnect()
    }
  }, [db])

  return <SyncliteContext.Provider value={db}>{children}</SyncliteContext.Provider>
}

// ── useSynclite ───────────────────────────────────────────────────────────────

/**
 * Access the raw `Synclite` instance to call `set`, `delete`, `batch`, `sync`, etc.
 *
 * @example
 * ```tsx
 * const db = useSynclite()
 * db.set('note:1', { title: 'Hello' })
 * ```
 */
export function useSynclite(): Synclite {
  const db = useContext(SyncliteContext)
  if (!db) {
    throw new Error(
      'useSynclite: no SyncliteProvider found in the component tree. ' +
        'Wrap your component with <SyncliteProvider>.',
    )
  }
  return db
}

'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Synclite, type SyncliteConfig } from '@synclite/core'
import { AsyncStorageStore } from './store/AsyncStorageStore.js'

const SyncliteContext = createContext<Synclite | null>(null)

export type SyncliteProviderProps = Omit<SyncliteConfig, 'storeInstance'> & {
  children: React.ReactNode
}

/**
 * React Native provider that wraps your app and makes Synclite available via hooks.
 * Uses AsyncStorage for persistent offline storage automatically.
 *
 * @example
 * ```tsx
 * export default function App() {
 *   return (
 *     <SyncliteProvider relay="wss://relay.example.com" appId="my-app">
 *       <MyApp />
 *     </SyncliteProvider>
 *   )
 * }
 * ```
 */
export function SyncliteProvider({ children, ...config }: SyncliteProviderProps) {
  const [db] = useState(() => new Synclite({ ...config, storeInstance: new AsyncStorageStore() }))

  useEffect(() => {
    return () => {
      db.disconnect()
    }
  }, [db])

  return <SyncliteContext.Provider value={db}>{children}</SyncliteContext.Provider>
}

/**
 * Access the Synclite instance from any component inside `SyncliteProvider`.
 * Throws if called outside the provider.
 */
export function useSynclite(): Synclite {
  const db = useContext(SyncliteContext)
  if (!db) {
    throw new Error(
      'Synclite: useSynclite() was called outside of <SyncliteProvider>. ' +
        'Wrap your app (or the relevant subtree) with <SyncliteProvider>.',
    )
  }
  return db
}

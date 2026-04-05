'use client'

import { useEffect, useState } from 'react'
import { loadSettings } from '../../lib/settings'
import { fetchOps, type Op } from '../../lib/api'

export default function SyncActivityPage() {
  const [ops, setOps] = useState<Op[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const settings = loadSettings()

    async function load() {
      try {
        const data = await fetchOps(settings.relayUrl, settings.appId, settings.token, 50)
        setOps(data)
        setError(null)
      } catch {
        setError('Failed to load operations')
      }
    }

    void load()
    const interval = setInterval(() => void load(), 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Sync Activity</h1>
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-900/40 border border-red-700 rounded text-red-300 text-sm">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-2">
        {ops.length === 0 ? (
          <div className="text-gray-500 text-sm py-8 text-center">No operations yet</div>
        ) : (
          ops.map((op) => (
            <div
              key={op.id}
              className="bg-gray-900 border border-gray-800 rounded px-4 py-3 flex items-center gap-4 text-sm"
            >
              <span className="text-gray-500 tabular-nums text-xs w-20 shrink-0">
                {new Date(op.timestamp).toLocaleTimeString()}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${
                  op.type === 'set'
                    ? 'bg-blue-900/60 text-blue-300'
                    : 'bg-red-900/60 text-red-300'
                }`}
              >
                {op.type}
              </span>
              <span className="font-mono text-blue-400 truncate flex-1">{op.key}</span>
              <span className="font-mono text-gray-500 text-xs shrink-0">
                {op.deviceId.slice(0, 8)}...
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

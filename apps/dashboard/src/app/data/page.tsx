'use client'

import { useEffect, useState } from 'react'
import { loadSettings } from '../../lib/settings'
import { fetchData, type DataRow } from '../../lib/api'

export default function DataExplorerPage() {
  const [rows, setRows] = useState<DataRow[]>([])
  const [prefix, setPrefix] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const settings = loadSettings()

    async function load() {
      try {
        const data = await fetchData(settings.relayUrl, settings.appId, settings.token, prefix || undefined)
        setRows(data)
        setError(null)
      } catch {
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    void load()
    const interval = setInterval(() => void load(), 10000)
    return () => clearInterval(interval)
  }, [prefix])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Data Explorer</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter by prefix..."
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-100 placeholder-gray-500 w-64 focus:outline-none focus:border-blue-500"
        />
      </div>
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-900/40 border border-red-700 rounded text-red-300 text-sm">
          {error}
        </div>
      )}
      {loading ? (
        <div className="text-gray-500 text-sm">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-gray-400">
                <th className="pb-3 pr-4 font-medium">Key</th>
                <th className="pb-3 pr-4 font-medium">Value</th>
                <th className="pb-3 pr-4 font-medium">Timestamp</th>
                <th className="pb-3 font-medium">Device ID</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No data found
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.key} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                    <td className="py-3 pr-4 font-mono text-blue-400">{row.key}</td>
                    <td className="py-3 pr-4 font-mono text-gray-300 max-w-xs truncate">
                      {JSON.stringify(row.value).slice(0, 80)}
                    </td>
                    <td className="py-3 pr-4 text-gray-400">
                      {new Date(row.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 font-mono text-gray-500 text-xs">
                      {row.deviceId.slice(0, 8)}...
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { loadSettings } from '../../lib/settings'
import { fetchClients, type Client } from '../../lib/api'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const settings = loadSettings()

    async function load() {
      try {
        const data = await fetchClients(settings.relayUrl, settings.token)
        setClients(data)
        setError(null)
      } catch {
        setError('Failed to load clients')
      }
    }

    void load()
    const interval = setInterval(() => void load(), 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Connected Clients</h1>
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-900/40 border border-red-700 rounded text-red-300 text-sm">
          {error}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-gray-400">
              <th className="pb-3 pr-4 font-medium">Device ID</th>
              <th className="pb-3 pr-4 font-medium">App ID</th>
              <th className="pb-3 pr-4 font-medium">User ID</th>
              <th className="pb-3 font-medium">Connected</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  No clients connected
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                  <td className="py-3 pr-4 font-mono text-blue-400 text-xs">
                    {client.deviceId.slice(0, 8)}...
                  </td>
                  <td className="py-3 pr-4 text-gray-300">{client.appId}</td>
                  <td className="py-3 pr-4 text-gray-400">{client.userId ?? '—'}</td>
                  <td className="py-3 text-gray-400">
                    {new Date(client.connectedAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

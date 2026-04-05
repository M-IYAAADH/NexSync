'use client'

import { useEffect, useState } from 'react'
import { loadSettings } from '../lib/settings'
import { fetchStats, type Stats } from '../lib/api'

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="text-sm text-gray-400 mb-2">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-1/2 mb-3" />
      <div className="h-8 bg-gray-700 rounded w-3/4" />
    </div>
  )
}

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const settings = loadSettings()

    async function load() {
      try {
        const s = await fetchStats(settings.relayUrl, settings.appId, settings.token)
        setStats(s)
        setError(null)
      } catch {
        setError('Failed to connect to relay')
      }
    }

    void load()
    const interval = setInterval(() => void load(), 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Overview</h1>
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-900/40 border border-red-700 rounded text-red-300 text-sm">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats === null ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard label="Connected Clients" value={stats.connectedClients} />
            <StatCard label="Total Ops" value={stats.totalOps} />
            <StatCard label="Ops Last Minute" value={stats.opsLastMinute} />
            <StatCard
              label="Latest Timestamp"
              value={stats.latestTimestamp > 0 ? new Date(stats.latestTimestamp).toLocaleTimeString() : 'N/A'}
            />
          </>
        )}
      </div>
    </div>
  )
}

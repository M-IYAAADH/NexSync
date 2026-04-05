'use client'

import { useEffect, useState } from 'react'
import { loadSettings, saveSettings, type DashboardSettings } from '../../lib/settings'

type ConnectionStatus = 'idle' | 'connected' | 'failed'

export default function SettingsPage() {
  const [settings, setSettings] = useState<DashboardSettings>({
    relayUrl: 'http://localhost:8080',
    appId: 'default',
    token: '',
  })
  const [status, setStatus] = useState<ConnectionStatus>('idle')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  function handleChange(field: keyof DashboardSettings, value: string) {
    setSettings((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  function handleSave() {
    saveSettings(settings)
    setSaved(true)
  }

  async function handleTest() {
    setStatus('idle')
    try {
      const res = await fetch(`${settings.relayUrl}/health`)
      if (res.ok) {
        setStatus('connected')
      } else {
        setStatus('failed')
      }
    } catch {
      setStatus('failed')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="max-w-lg bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-gray-400">Relay URL</label>
          <input
            type="text"
            value={settings.relayUrl}
            onChange={(e) => handleChange('relayUrl', e.target.value)}
            placeholder="http://localhost:8080"
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-gray-400">App ID</label>
          <input
            type="text"
            value={settings.appId}
            onChange={(e) => handleChange('appId', e.target.value)}
            placeholder="default"
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-gray-400">Token</label>
          <input
            type="password"
            value={settings.token}
            onChange={(e) => handleChange('token', e.target.value)}
            placeholder="Leave empty for open relay"
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors"
          >
            Save Settings
          </button>
          <button
            onClick={() => void handleTest()}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
          >
            Test Connection
          </button>
          {saved && <span className="text-green-400 text-sm">Saved</span>}
          {status === 'connected' && (
            <span className="px-2 py-0.5 bg-green-900/60 text-green-300 text-xs rounded">
              Connected
            </span>
          )}
          {status === 'failed' && (
            <span className="px-2 py-0.5 bg-red-900/60 text-red-300 text-xs rounded">Failed</span>
          )}
        </div>
      </div>
    </div>
  )
}

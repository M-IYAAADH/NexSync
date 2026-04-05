export type Stats = {
  connectedClients: number
  totalOps: number
  latestTimestamp: number
  opsLastMinute: number
}

export type DataRow = {
  key: string
  value: Record<string, unknown>
  timestamp: number
  deviceId: string
  userId: string | undefined
}

export type Op = {
  id: string
  type: string
  key: string
  value: Record<string, unknown> | undefined
  timestamp: number
  deviceId: string
  userId: string | undefined
}

export type Client = {
  id: string
  appId: string
  userId: string | undefined
  deviceId: string
  connectedAt: number
}

function headers(token: string): Record<string, string> {
  if (token.length > 0) {
    return { Authorization: `Bearer ${token}` }
  }
  return {}
}

export async function fetchStats(baseUrl: string, appId: string, token: string): Promise<Stats> {
  const res = await fetch(`${baseUrl}/api/stats?appId=${encodeURIComponent(appId)}`, {
    headers: headers(token),
  })
  const data = await res.json() as Stats
  return data
}

export async function fetchData(
  baseUrl: string,
  appId: string,
  token: string,
  prefix?: string,
): Promise<DataRow[]> {
  const params = new URLSearchParams({ appId })
  if (prefix !== undefined && prefix.length > 0) params.set('prefix', prefix)
  const res = await fetch(`${baseUrl}/api/data?${params.toString()}`, {
    headers: headers(token),
  })
  const data = await res.json() as { data: DataRow[] }
  return data.data
}

export async function fetchOps(
  baseUrl: string,
  appId: string,
  token: string,
  limit = 100,
): Promise<Op[]> {
  const res = await fetch(
    `${baseUrl}/api/ops?appId=${encodeURIComponent(appId)}&limit=${limit}`,
    { headers: headers(token) },
  )
  const data = await res.json() as { ops: Op[] }
  return data.ops
}

export async function fetchClients(baseUrl: string, token: string): Promise<Client[]> {
  const res = await fetch(`${baseUrl}/api/clients`, { headers: headers(token) })
  const data = await res.json() as { clients: Client[] }
  return data.clients
}

export async function fetchApps(baseUrl: string, token: string): Promise<string[]> {
  const res = await fetch(`${baseUrl}/api/apps`, { headers: headers(token) })
  const data = await res.json() as { apps: string[] }
  return data.apps
}

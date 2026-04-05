/** An operation persisted in the relay's op log. */
export type Operation = {
  id: string
  type: 'set' | 'delete'
  key: string
  value: Record<string, unknown> | undefined
  timestamp: number
  deviceId: string
  userId: string | undefined
  synced: boolean
}

/** Messages the client sends to the relay. */
export type ClientMessage =
  | { type: 'auth'; appId: string; userId: string | undefined; token: string | undefined }
  | { type: 'ops'; ops: Operation[] }
  | { type: 'sync'; since: number }

/** Messages the relay sends to the client. */
export type RelayMessage =
  | { type: 'auth:ok'; deviceId: string }
  | { type: 'auth:error'; message: string }
  | { type: 'ops'; ops: Operation[] }
  | { type: 'sync:complete'; latest: number }
  | { type: 'error'; code: string; message: string }

/** A connected client tracked in memory. */
export type ConnectedClient = {
  id: string
  appId: string
  userId: string | undefined
  deviceId: string
  connectedAt: number
}

/** Relay configuration loaded from environment variables. */
export type RelayConfig = {
  port: number
  databasePath: string
  jwtSecret: string | undefined
  authWebhook: string | undefined
  maxPayloadBytes: number
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  corsOrigins: string
}

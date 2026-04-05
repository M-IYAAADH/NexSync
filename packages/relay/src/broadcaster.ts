import type WebSocket from 'ws'
import type { ConnectedClient, Operation, RelayMessage } from './types.js'

/**
 * Tracks connected WebSocket clients and fans out operations to peers.
 * Lives entirely in memory — no persistence needed here.
 */
export class Broadcaster {
  // connectionId → { ws, client }
  private connections = new Map<string, { ws: WebSocket; client: ConnectedClient }>()

  /** Register a newly authenticated connection. */
  add(id: string, ws: WebSocket, client: ConnectedClient): void {
    this.connections.set(id, { ws, client })
  }

  /** Remove a connection (on disconnect). */
  remove(id: string): void {
    this.connections.delete(id)
  }

  /**
   * Send operations to all clients in the same app except the sender.
   * Silently skips clients with closed sockets.
   */
  broadcast(fromConnectionId: string, appId: string, ops: Operation[]): void {
    const msg: RelayMessage = { type: 'ops', ops }
    const raw = JSON.stringify(msg)

    for (const [id, { ws, client }] of this.connections) {
      if (id === fromConnectionId) continue
      if (client.appId !== appId) continue
      if (ws.readyState !== ws.OPEN) continue
      ws.send(raw)
    }
  }

  /** Send a message directly to a single connection. */
  sendTo(connectionId: string, msg: RelayMessage): void {
    const conn = this.connections.get(connectionId)
    if (conn && conn.ws.readyState === conn.ws.OPEN) {
      conn.ws.send(JSON.stringify(msg))
    }
  }

  /** Return all currently connected clients (for the dashboard / admin). */
  getClients(): ConnectedClient[] {
    return [...this.connections.values()].map(({ client }) => client)
  }

  /** Return the number of connections in a given app. */
  countForApp(appId: string): number {
    let count = 0
    for (const { client } of this.connections.values()) {
      if (client.appId === appId) count++
    }
    return count
  }
}

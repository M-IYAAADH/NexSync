# OpenSync

> Universal offline-first sync primitive for any app or framework.

**SQLite but with sync** — embed it anywhere, works offline, syncs automatically.

---

## Install

```bash
npm install @opensync/core
```

## Usage

```typescript
import { OpenSync } from '@opensync/core'

const db = new OpenSync({ relay: 'wss://relay.example.com' })

// Write — instant locally, queued for sync
db.set('note:1', { title: 'Hello' })

// Read
const note = await db.get('note:1')

// Subscribe to live updates
const unsub = db.subscribe('note:1', (value) => {
  console.log('updated:', value)
})

// Query by prefix
const notes = await db.query('note:')

// Works offline — queue flushes when connection restores
db.set('note:2', { title: 'Created offline' })
```

## React

```tsx
import { OpenSyncProvider, useValue, useQuery } from '@opensync/react'

function App() {
  return (
    <OpenSyncProvider relay="wss://relay.example.com" userId="user-1">
      <NoteList />
    </OpenSyncProvider>
  )
}

function NoteList() {
  const notes = useQuery('note:')
  return Object.entries(notes).map(([key, note]) => (
    <div key={key}>{note.title}</div>
  ))
}
```

## Self-host the Relay

```bash
# Docker (recommended)
docker run -p 8080:8080 -e JWT_SECRET=mysecret opensync/relay

# Or run directly
npx @opensync/relay start
```

Environment variables:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | WebSocket port |
| `DATABASE_PATH` | `./relay.db` | SQLite file path |
| `JWT_SECRET` | — | JWT auth (optional, open in dev) |
| `AUTH_WEBHOOK` | — | Custom auth endpoint |
| `LOG_LEVEL` | `info` | `debug \| info \| warn \| error` |

## Features

- **Offline-first** — writes are instant, sync happens in the background
- **Automatic conflict resolution** — Last-Write-Wins with Lamport timestamps; delete always wins
- **Reactive subscriptions** — `subscribe(key, cb)` and `subscribePrefix(prefix, cb)`
- **Prefix queries** — `db.query('note:')` returns all matching keys
- **Self-hostable relay** — SQLite-backed, Docker-ready, stateless-friendly
- **Auth** — JWT or custom webhook; open in dev mode
- **Rate limiting** — 100 ops/second per client
- **Reconnection** — exponential backoff (1s → 30s), queued messages never lost

## Architecture

```
App
 └─ @opensync/core
     ├─ LocalStore   (IndexedDB / SQLite / Memory)
     ├─ CRDT Layer   (LWW + Automerge)
     ├─ Op Queue     (offline persistence)
     └─ WS Manager   (connect / reconnect / heartbeat)
          │ wss://
     @opensync/relay
          ├─ WebSocket Server
          ├─ SQLite Op Log
          └─ Broadcaster
```

## Packages

| Package | Description | Status |
|---|---|---|
| `@opensync/core` | Client library | ✅ Phase 1 |
| `@opensync/relay` | Relay server | ✅ Phase 1 |
| `@opensync/react` | React hooks | Phase 2 |
| `@opensync/vue` | Vue composables | Phase 3 |
| `@opensync/react-native` | React Native adapter | Phase 3 |
| `@opensync/cli` | Developer CLI | Phase 3 |

## Development

```bash
pnpm install
pnpm build    # build all packages
pnpm test     # run all tests
pnpm typecheck
```

## License

MIT

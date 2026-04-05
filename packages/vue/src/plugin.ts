import { type App, type InjectionKey } from 'vue'
import { Synclite, type SyncliteConfig } from '@synclite/core'

/** Injection key used to share the Synclite instance via Vue's provide/inject. */
export const SYNCLITE_KEY: InjectionKey<Synclite> = Symbol('synclite')

/**
 * Create a Vue plugin that installs Synclite globally.
 *
 * @example
 * ```ts
 * import { createApp } from 'vue'
 * import { createSynclite } from '@synclite/vue'
 *
 * const app = createApp(App)
 * app.use(createSynclite({ relay: 'wss://relay.example.com', appId: 'my-app' }))
 * app.mount('#app')
 * ```
 */
export function createSynclite(config: SyncliteConfig): { install(app: App): void } {
  return {
    install(app: App) {
      const db = new Synclite(config)
      app.provide(SYNCLITE_KEY, db)
    },
  }
}

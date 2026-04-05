type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 }

export class Logger {
  private min: number

  constructor(level: LogLevel = 'info') {
    this.min = LEVELS[level]
  }

  debug(msg: string, ...args: unknown[]): void {
    if (this.min <= 0) console.debug(`[relay] ${msg}`, ...args)
  }

  info(msg: string, ...args: unknown[]): void {
    if (this.min <= 1) console.info(`[relay] ${msg}`, ...args)
  }

  warn(msg: string, ...args: unknown[]): void {
    if (this.min <= 2) console.warn(`[relay] ${msg}`, ...args)
  }

  error(msg: string, ...args: unknown[]): void {
    if (this.min <= 3) console.error(`[relay] ${msg}`, ...args)
  }
}

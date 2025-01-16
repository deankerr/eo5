import { Client, ClientOptions } from 'jsr:@irc/client'

export type IRCServiceConfig = {
  textFilter?: (text: string) => string
} & ClientOptions

type Source = {
  name: string
  mask?: { user: string; host: string }
}

export type IRCEvents = {
  privmsg: { event: 'privmsg'; source?: Source; params: { target: string; text: string } }
  action: { event: 'action'; source?: Source; params: { target: string; text: string } }
  notice: { event: 'notice'; source?: Source; params: { target: string; text: string } }
  join: { event: 'join'; source?: Source; params: { channel: string } }
  part: { event: 'part'; source?: Source; params: { channel: string; comment?: string } }
  kick: { event: 'kick'; source?: Source; params: { channel: string; nick: string; comment?: string } }
  kill: { event: 'kill'; source?: Source; params: { nick: string; comment?: string } }
  nick: { event: 'nick'; source?: Source; params: { nick: string } }
  quit: { event: 'quit'; source?: Source; params: { comment?: string } }
}
export type IRCEvent = IRCEvents[keyof IRCEvents]

export type IRCServerEvents = {
  nicklist: { event: 'nicklist'; channel: string; nicklist: { prefix: string; nick: string }[] }
  connecting: { event: 'connecting'; hostname: string; port?: number; tls?: boolean }
  connected: { event: 'connected'; hostname: string; port?: number; tls?: boolean }
  disconnected: { event: 'disconnected'; hostname: string; port?: number; tls?: boolean }
  reconnecting: { event: 'reconnecting'; hostname: string; port?: number; tls?: boolean }
  register: { event: 'register'; source?: Source; params: { nick: string; text: string } }
  error_reply: { event: 'error_reply'; hostname?: string; command: string; args: string[]; value: string }
}

export class IRCService {
  private _client: Client
  private proxy: Client
  private textFilter: (text: string) => string

  constructor(config: IRCServiceConfig) {
    const { textFilter, ...options } = config

    this._client = new Client(options)
    this.textFilter = textFilter || defaultTextFilter

    // Create a proxy to intercept all client method calls
    this.proxy = new Proxy(this._client, {
      get: (target, prop, receiver) => {
        const original = Reflect.get(target, prop, receiver)
        if (typeof original !== 'function') return original

        return (...args: unknown[]) => {
          // apply text filter to all string arguments
          const filteredArgs = args.map((arg) => (typeof arg === 'string' ? this.textFilter(arg) : arg))
          return original.apply(target, filteredArgs)
        }
      },
    })

    this.proxy.on('connecting', (data) => console.log('[connecting]', data))
    this.proxy.on('connected', (data) => console.log('[connected]', data))
    this.proxy.on('disconnected', (data) => console.log('[disconnected]', data))
    this.proxy.on('reconnecting', (data) => console.log('[reconnecting]', data))
    this.proxy.on('notice', (data) => console.log('[notice]', data))
  }

  get client(): Client {
    return this.proxy
  }
}

function defaultTextFilter(text: string) {
  // limit max output length
  const output = text.slice(0, 480)
  return output
}


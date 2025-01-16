import type { IRCEvent, IRCService } from './irc.ts'
import type { BaseService } from './services.ts'

export class Core {
  private services: Map<string, BaseService> = new Map()

  constructor(private irc: IRCService) {
    this.irc.client.on('privmsg', (event) => {
      this.broadcast({ event: 'privmsg', ...event })
    })
    this.irc.client.on('ctcp_action', (event) => {
      this.broadcast({ event: 'action', ...event })
    })
    this.irc.client.on('notice', (event) => {
      this.broadcast({ event: 'notice', ...event })
    })
    this.irc.client.on('join', (event) => {
      this.broadcast({ event: 'join', ...event })
    })
    this.irc.client.on('part', (event) => {
      this.broadcast({ event: 'part', ...event })
    })
    this.irc.client.on('kick', (event) => {
      this.broadcast({ event: 'kick', ...event })
    })
    this.irc.client.on('kill', (event) => {
      this.broadcast({ event: 'kill', ...event })
    })
    this.irc.client.on('nick', (event) => {
      this.broadcast({ event: 'nick', ...event })
    })
    this.irc.client.on('quit', (event) => {
      this.broadcast({ event: 'quit', ...event })
    })
  }

  private broadcast(event: IRCEvent) {
    for (const service of this.services.values()) {
      service.handleEvent(event)
    }
  }

  registerService(name: string, service: BaseService) {
    service.setClient(this.irc)
    this.services.set(name, service)
  }
}

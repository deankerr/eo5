import type { IRCEvent, IRCService } from './irc.ts'
import type { BaseService } from './services.ts'

export class IrcBot {
  private services: BaseService[] = []

  constructor(private irc: IRCService) {
    this.irc.client.on('privmsg', (event) => {
      this.broadcast({ event: 'message', ...event })
    })
  }

  private broadcast(event: IRCEvent) {
    for (const service of this.services) {
      service.handleEvent(event)
    }
  }

  registerService(service: BaseService) {
    service.setClient(this.irc)
    this.services.push(service)
  }
}

import { type IRCEvent } from '../core/irc.ts'
import { BaseService } from '../core/services.ts'

export class EchoService extends BaseService {
  processEvent(event: IRCEvent) {
    if (event.event === 'message') {
      this.irc?.client.privmsg(event.params.target, `echo: ${event.params.text}`)
    }
  }
}

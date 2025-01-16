import { type IRCEvent } from '../core/irc.ts'
import { BaseService } from '../core/services.ts'

export class EchoService extends BaseService {
  processEvent(event: IRCEvent) {
    console.log('echo', event)
    if (event.event === 'privmsg') {
      this.irc?.client.privmsg(event.params.target, `echo: ${event.params.text}`)
    }
  }
}

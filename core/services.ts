import type { IRCEvent, IRCService } from './irc.ts'

class EventBuffer {
  private buffer: IRCEvent[] = []
  private waiting: ((value: IRCEvent) => void)[] = []

  push(message: IRCEvent) {
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift()!
      resolve(message)
    } else {
      this.buffer.push(message)
    }
  }

  async *[Symbol.asyncIterator]() {
    while (true) {
      if (this.buffer.length > 0) {
        yield this.buffer.shift()!
      } else {
        const message = await new Promise<IRCEvent>((resolve) => {
          this.waiting.push(resolve)
        })
        yield message
      }
    }
  }
}

export abstract class BaseService {
  protected eventBuffer = new EventBuffer()
  protected irc?: IRCService

  constructor() {
    this.start()
  }

  setClient(client: IRCService) {
    this.irc = client
  }

  private async start() {
    for await (const message of this.eventBuffer) {
      await this.processEvent(message)
    }
  }

  handleEvent(event: IRCEvent) {
    this.eventBuffer.push(event)
  }

  protected abstract processEvent(event: IRCEvent): void | Promise<void>
}

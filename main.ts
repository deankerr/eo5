import { IrcBot } from './core/core.ts'
import { IRCService } from './core/irc.ts'
import { EchoService } from './services/echo.ts'

globalThis.addEventListener('unhandledrejection', (e) => {
  console.error('unhandled rejection at:', e.promise, 'reason:', e.reason)
  e.preventDefault()
})

console.log('*** IRC ***')
console.log('IRC_HOSTNAME:', Deno.env.get('IRC_HOSTNAME'))
console.log('IRC_NICK:', Deno.env.get('IRC_NICK'))
console.log('IRC_CHANNEL:', Deno.env.get('IRC_CHANNEL'))

const irc = new IRCService({
  nick: Deno.env.get('IRC_NICK')!,
  channels: [Deno.env.get('IRC_CHANNEL')!],
})

const bot = new IrcBot(irc)
bot.registerService(new EchoService())

irc.client.connect(Deno.env.get('IRC_HOSTNAME')!)

import { Core } from './core/core.ts'
import { IRCService } from './core/irc.ts'
import { EchoService } from './services/echo.ts'
import { parseArgs } from 'jsr:@std/cli/parse-args'

globalThis.addEventListener('unhandledrejection', (e) => {
  console.error('unhandled rejection at:', e.promise, 'reason:', e.reason)
  e.preventDefault()
})

type IRCChannels = [
  channel: string | [channel: string, key: string],
  ...channels: (string | [channel: string, key: string])[],
]

function getChannels(channels?: string) {
  if (!channels) return
  return channels.split(',') as IRCChannels
}

function getConfig() {
  const args = parseArgs(Deno.args, {
    string: ['nick', 'channels', 'hostname', 'username', 'realname'],
    boolean: ['debug'],
  })

  const hostname = args.hostname || Deno.env.get('IRC_HOSTNAME')
  if (!hostname) throw new Error('hostname is required')

  return {
    hostname,
    nick: args.nick || Deno.env.get('IRC_NICK') || 'eo5',
    channels: getChannels(args.channels || Deno.env.get('IRC_CHANNELS')),
    username: args.username || Deno.env.get('IRC_USERNAME'),
    realname: args.realname || Deno.env.get('IRC_REALNAME'),
    verbose: args.debug ? ('formatted' as const) : undefined,

    floodDelay: 1000,
    pingTimeout: false,
  } as const
}

const config = getConfig()

console.log('*** eo5 ***')
console.log(config)

const irc = new IRCService(config)

const core = new Core(irc)
core.registerService('echo', new EchoService())

irc.client.connect(config.hostname)

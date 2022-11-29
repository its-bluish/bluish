/* eslint-disable @typescript-eslint/no-confusing-void-expression */
/* eslint-disable @typescript-eslint/no-invalid-void-type */
import Emitter from '@cookiex/emitter'
import {
  ChildProcess,
  Serializable,
  spawn,
  SpawnOptions as ChildProcessSpawnOptions,
} from 'child_process'

export type SpawnArg =
  | string
  | number
  | Record<string, undefined | string | number | boolean>
  | SpawnArg[]

export interface SpawnEvents {
  close(): void
  disconnect(): void
  error(): void
  exit(code: number | null, signal: NodeJS.Signals | null): void
  message(message: Serializable): void
  spawn(): void
}

export interface SpawnOptions extends ChildProcessSpawnOptions {
  asleep?: boolean
}

export class Spawn extends Emitter<SpawnEvents> implements PromiseLike<void> {
  protected static argsToArray(args?: SpawnArg): string[] {
    if (!args) return []

    if (Array.isArray(args)) return args.flatMap((arg) => Spawn.argsToArray(arg))

    if (typeof args === 'string') return args.split(' ')

    if (typeof args === 'number') return [args.toString()]

    return Object.entries(args).reduce<string[]>((flags, [key, value]) => {
      const flag = key.length === 1 ? `-${key}` : `--${key}`

      if (typeof value === 'string') return flags.concat([flag, value])

      if (typeof value === 'boolean' && value) return flags.concat([flag])

      if (typeof value === 'number') return flags.concat([flag, value.toString()])

      return flags
    }, [])
  }

  public process: ChildProcess | null = null
  public command: string
  public args: string[]
  public options: ChildProcessSpawnOptions

  constructor(spawnArgs: SpawnArg, { asleep = false, ...options }: SpawnOptions = {}) {
    super()

    const [command, ...args] = Spawn.argsToArray(spawnArgs)

    this.command = command
    this.args = args
    this.options = options

    if (!asleep) this.toWakeUp()
  }

  public toWakeUp() {
    if (this.process) throw new Error('TODO')

    this.process = spawn(this.command, this.args, this.options)

    this.process.on('close', () => this.emit('close'))
    this.process.on('disconnect', () => this.emit('disconnect'))
    this.process.on('error', () => this.emit('error'))
    this.process.on('exit', (code, signal) => this.emit('exit', code, signal))
    this.process.on('message', (message) => this.emit('message', message))
    this.process.on('spawn', () => this.emit('spawn'))

    return this.process
  }

  public then<TResult1 = void, TResult2 = never>(
    onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null | undefined,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null | undefined,
  ): PromiseLike<TResult1 | TResult2> {
    return new Promise<void>((resolve, reject) => {
      if (!this.process) throw new Error('TODO')

      this.process.on('close', (signal) => {
        if (signal === 0) resolve()
      })

      this.process.on('error', (error) => {
        reject(error)
      })
    }).then(onfulfilled, onrejected)
  }

  public async kill(signal?: number | NodeJS.Signals) {
    return new Promise<number | null>((resolve) => {
      if (!this.process) throw new Error('TODO')

      this.process.on('exit', resolve)

      this.process.kill(signal)
    })
  }
}

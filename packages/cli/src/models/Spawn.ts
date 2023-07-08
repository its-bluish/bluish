import {
  type ChildProcess,
  spawn,
  type SpawnOptions as ChildProcessSpawnOptions,
} from 'child_process'

import {
  AsynchronousEvent,
  AsynchronousEventEmitter,
} from 'ts-asynchronous-event-emitter'

export type SpawnArg =
  | string
  | number
  | Record<string, undefined | string | number | boolean>
  | SpawnArg[]

export type SpawnEvents =
  | AsynchronousEvent<'close', unknown>
  | AsynchronousEvent<'disconnect', unknown>
  | AsynchronousEvent<'error', unknown>
  // exit(code: number | null, signal: NodeJS.Signals | null): void
  | AsynchronousEvent<'exit', unknown>
  // message(message: Serializable): void
  | AsynchronousEvent<'message', unknown>
  | AsynchronousEvent<'spawn', unknown>

export interface SpawnOptions extends ChildProcessSpawnOptions {
  asleep?: boolean
}

export class Spawn
  extends AsynchronousEventEmitter<SpawnEvents>
  implements PromiseLike<void>
{
  protected static argsToArray(args?: SpawnArg): string[] {
    if (!args) return []

    if (Array.isArray(args)) return args.flatMap(arg => Spawn.argsToArray(arg))

    if (typeof args === 'string') return args.split(' ')

    if (typeof args === 'number') return [args.toString()]

    return Object.entries(args).reduce<string[]>((flags, [key, value]) => {
      const flag = key.length === 1 ? `-${key}` : `--${key}`

      if (typeof value === 'string') return flags.concat([flag, value])

      if (typeof value === 'boolean' && value) return flags.concat([flag])

      if (typeof value === 'number')
        return flags.concat([flag, value.toString()])

      return flags
    }, [])
  }

  public process: ChildProcess | null = null
  public command: string
  public args: string[]
  public options: ChildProcessSpawnOptions

  constructor(
    spawnArgs: SpawnArg,
    { asleep = false, ...options }: SpawnOptions = {},
  ) {
    super()

    const [command, ...args] = Spawn.argsToArray(spawnArgs)

    this.command = command
    this.args = args
    this.options = options

    if (!asleep) this.toWakeUp()
  }

  public toWakeUp(): ChildProcess {
    if (this.process)
      throw new Error(
        'The process is or has already been executed, it is not possible to execute the same instance twice.',
      )

    this.process = spawn(this.command, this.args, this.options)

    this.process.on(
      'close',
      () => void this.emit(new AsynchronousEvent('close')),
    )
    this.process.on(
      'disconnect',
      () => void this.emit(new AsynchronousEvent('disconnect')),
    )
    this.process.on(
      'error',
      () => void this.emit(new AsynchronousEvent('error')),
    )
    this.process.on(
      'exit',
      (code, signal) => void this.emit(new AsynchronousEvent('exit')),
    )
    this.process.on(
      'message',
      message => void this.emit(new AsynchronousEvent('message')),
    )
    this.process.on(
      'spawn',
      () => void this.emit(new AsynchronousEvent('spawn')),
    )

    return this.process
  }

  public then<TResult1 = void, TResult2 = never>(
    onfulfilled?:
      | ((value: void) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined,
  ): PromiseLike<TResult1 | TResult2> {
    return new Promise<void>((resolve, reject) => {
      if (!this.process)
        throw new Error(
          'There is no process running or already terminated, before calling invoke thenable make sure to wake up the process',
        )

      this.process.on('close', signal => {
        if (signal === 0) resolve()
      })

      this.process.on('error', error => {
        reject(error)
      })
    }).then(onfulfilled, onrejected)
  }

  public async kill(signal?: number | NodeJS.Signals): Promise<void> {
    await new Promise<number | null>(resolve => {
      if (!this.process)
        throw new Error('There is no instance of the process to be killed.')

      this.process.on('exit', resolve)

      this.process.kill(signal)
    })
  }
}

import { ChildProcess, spawn } from 'child_process'
import path from 'path'
import Emitter from '@cookiex/emitter'
import { DEFAULT_INSTALL_AZURE_FUNCTIONS_BINARIES_PATH } from '../constants'

export interface AzureFuncSpawnEvents {
  'exit'(code?: number): void
}

export type AzureFuncSpawnFlags = Record<string, string | number | boolean>

export interface AzureFuncSpawnOptions {
  flags: AzureFuncSpawnFlags
  cwd: string
  stdio?: boolean
}

export class AzureFuncSpawn extends Emitter<AzureFuncSpawnEvents> {
  protected spawn: ChildProcess

  constructor(args: string, { flags: unparsedFlags, cwd, stdio = true }: AzureFuncSpawnOptions) {
    super()

    const flags = Object.entries(unparsedFlags).reduce<string[]>((flags, [key, value]) => {
      const flag = key.length === 1 ? `-${key}` : `--${key}`

      if (typeof value === 'string') return flags.concat([flag, `"${value}"`])

      if (typeof value === 'boolean' && value) return flags.concat([flag])

      if (typeof value === 'number') return flags.concat([flag, value.toString()])

      return flags
    }, [])

    const command = path.join(DEFAULT_INSTALL_AZURE_FUNCTIONS_BINARIES_PATH, 'func')

    this.spawn = spawn(command, [args, ...flags], {
      stdio: stdio ? [process.stdin, process.stdout, process.stderr, 'pipe'] : void 0,
      cwd: cwd,
    })

    this.spawn.on('exit', (code) => {
      this.emit('exit', code ?? void 0)
    })
  }

  public kill() {
    this.spawn.kill()
  }
}

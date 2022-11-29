import {
  ConfigurationAzurite,
  ConfigurationAzuriteServer,
  AzuriteServices,
} from '../interfaces/Configuration'
import { PromptModule } from 'inquirer'
import { Spawn } from './Spawn'
import { portIsAvailable } from '../tools/portIsAvailable'
import { nextPortAvailable } from '../tools/nextPortAvailable'
import { AzuriteService } from './AzuriteService'

export interface AzuriteServerStartOptions {
  input: string
  output: string
  location?: string
}

export interface AzuriteServerConfiguration {
  prompt: PromptModule
  yes: boolean
}

export class AzuriteServer {
  protected blob: Required<ConfigurationAzuriteServer> | null = null
  protected queue: Required<ConfigurationAzuriteServer> | null = null
  protected table: Required<ConfigurationAzuriteServer> | null = null
  protected spawns: Partial<Record<AzuriteServices, Spawn>> = {}

  constructor(protected config: AzuriteServerConfiguration, options?: ConfigurationAzurite) {
    if (options === true) {
      this.blob = { host: '127.0.0.1', port: 10000, start: true }
      this.queue = { host: '127.0.0.1', port: 10001, start: true }
      this.table = { host: '127.0.0.1', port: 10002, start: true }
    } else if (typeof options === 'object') {
      const { blob = false, queue = false, table = false } = options

      if (blob)
        if (typeof blob === 'boolean') this.blob = { host: '127.0.0.1', port: 10000, start: true }
        else this.blob = { host: '127.0.0.1', port: 10000, start: true, ...blob }

      if (queue)
        if (typeof queue === 'boolean') this.queue = { host: '127.0.0.1', port: 10000, start: true }
        else this.queue = { host: '127.0.0.1', port: 10001, start: true, ...queue }

      if (table)
        if (typeof table === 'boolean') this.table = { host: '127.0.0.1', port: 10000, start: true }
        else this.table = { host: '127.0.0.1', port: 10002, start: true, ...table }
    }
  }

  public hasAzurite(input: string) {
    try {
      require.resolve('azurite', {
        paths: [input],
      })
      return true
    } catch {
      return false
    }
  }

  public async installAzurite(input: string) {
    const { install } = this.config.yes
      ? { install: true }
      : await this.config.prompt({
          type: 'confirm',
          message: "Can't find the azurite package you want to install?",
          name: 'install',
        })

    if (!install) return false

    const { withYarn } = this.config.yes
      ? { withYarn: true }
      : await this.config.prompt({
          type: 'confirm',
          message: 'Do you want to install with yarn?',
          name: 'withYarn',
        })

    if (withYarn)
      await new Spawn('yarn add -D azurite', {
        stdio: [process.stdin, process.stdout, process.stderr, 'pipe'],
        cwd: input,
      })
    else
      await new Spawn('npm install azurite --save-dev', {
        stdio: [process.stdin, process.stdout, process.stderr, 'pipe'],
        cwd: input,
      })

    return true
  }

  private async _init(key: AzuriteServices, cwd: string, location?: string) {
    const config = this[key]

    if (!config) return void 0

    if (config.start && !(await portIsAvailable(config.port, config.host))) {
      const { withAnotherPort } = this.config.yes
        ? { withAnotherPort: true }
        : await this.config.prompt({
            type: 'confirm',
            message: `Port ${config.port} to start azurite ${key} server is busy, do you want to start on another port?`,
            name: 'withAnotherPort',
          })

      if (withAnotherPort) config.port = await nextPortAvailable(config.port, config.host)
      else config.start = false
    }

    if (config.start)
      this.spawns[key] = new AzuriteService(
        key,
        { ...config, location },
        {
          cwd,
        },
      )

    return void 0
  }

  public async start({ input, output, location }: AzuriteServerStartOptions) {
    if (!this.hasAzurite(input) && !(await this.installAzurite(input))) throw new Error('TODO')

    await this._init('blob', output, location)
    await this._init('queue', output, location)
    await this._init('table', output, location)
  }

  public async close() {
    await Promise.all([
      this.spawns.blob?.kill(),
      this.spawns.queue?.kill(),
      this.spawns.table?.kill(),
    ])
  }

  public hasAzuriteService() {
    return !!this.blob || !!this.queue || !!this.table
  }

  public toAzureWebJobsStorage() {
    const accountName = 'devstoreaccount1'
    const config = {
      DefaultEndpointsProtocol: 'http',
      AccountName: accountName,
      AccountKey:
        'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==',
      ...(this.blob && {
        BlobEndpoint: `http://${this.blob.host}:${this.blob.port}/${accountName}`,
      }),
      ...(this.queue && {
        QueueEndpoint: `http://${this.queue.host}:${this.queue.port}/${accountName}`,
      }),
      ...(this.table && {
        TableEndpoint: `http://${this.table.host}:${this.table.port}/${accountName}`,
      }),
    }

    return Object.entries(config)
      .map(([key, value]) => `${key}=${value}`)
      .join(';')
  }
}

/* eslint-disable complexity */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-depth */
/* eslint-disable max-lines-per-function */
/* eslint-disable no-constructor-return */
import {
  ConfigurationAzurite,
  ConfigurationAzuriteServer,
  AzuriteServers,
} from '../interfaces/Configuration'
import inquirer from 'inquirer'
import { Spawn } from './Spawn'
import { portIsAvailable } from '../tools/portIsAvailable'

export interface AzuriteServerStartOptions {
  input: string
  output: string
  location?: string
}

export class AzuriteServer {
  protected blob: Required<ConfigurationAzuriteServer> | null = null
  protected queue: Required<ConfigurationAzuriteServer> | null = null
  protected table: Required<ConfigurationAzuriteServer> | null = null
  protected spawns: Partial<Record<AzuriteServers, Spawn>> = {}

  constructor(
    configuration: ConfigurationAzurite | undefined,
    protected prompt: inquirer.PromptModule,
  ) {
    if (!configuration) return this
    if (configuration === true) {
      this.blob = { host: '127.0.0.1', port: 10000, start: true }
      this.queue = { host: '127.0.0.1', port: 10001, start: true }
      this.table = { host: '127.0.0.1', port: 10002, start: true }

      return this
    }
    const { blob = false, queue = false, table = false } = configuration

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
    const { install } = await this.prompt({
      type: 'confirm',
      message: "Can't find the azurite package you want to install?",
      name: 'install',
    })

    if (!install) return false

    const { withYarn } = await this.prompt({
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

  public async start({ input, output, location }: AzuriteServerStartOptions) {
    if (!this.hasAzurite(input) && !(await this.installAzurite(input))) throw new Error('TODO')

    if (this.blob) {
      if (this.blob.start && !(await portIsAvailable(this.blob.port, this.blob.host))) {
        const { withAnotherPort } = await this.prompt({
          type: 'confirm',
          message: `Port ${this.blob.port} to start azurite blob server is busy, do you want to start on another port?`,
          name: 'withAnotherPort',
        })

        if (withAnotherPort) {
          do {
            if (await portIsAvailable((this.blob.port += 1), this.blob.host)) break
          } while (!(await portIsAvailable(this.blob.port, this.blob.host)))
        } else this.blob.start = false
      }

      if (this.blob.start)
        this.spawns.blob = new Spawn(
          [
            'npx azurite-blob',
            '--blobPort',
            this.blob.port,
            '--blobHost',
            this.blob.host,
            { location },
          ],
          {
            cwd: output,
          },
        )
    }

    if (this.queue) {
      if (this.queue.start && !(await portIsAvailable(this.queue.port, this.queue.host))) {
        const { withAnotherPort } = await this.prompt({
          type: 'confirm',
          message: `Port ${this.queue.port} to start azurite queue server is busy, do you want to start on another port?`,
          name: 'withAnotherPort',
        })

        if (withAnotherPort) {
          do {
            if (await portIsAvailable((this.queue.port += 1), this.queue.host)) break
          } while (!(await portIsAvailable(this.queue.port, this.queue.host)))
        } else this.queue.start = false
      }

      if (this.queue.start)
        this.spawns.queue = new Spawn(
          [
            'npx azurite-queue',
            '--queuePort',
            this.queue.port,
            '--queueHost',
            this.queue.host,
            { location },
          ],
          {
            cwd: output,
          },
        )
    }

    if (this.table) {
      if (this.table.start && !(await portIsAvailable(this.table.port, this.table.host))) {
        const { withAnotherPort } = await this.prompt({
          type: 'confirm',
          message: `Port ${this.table.port} to start azurite table server is busy, do you want to start on another port?`,
          name: 'withAnotherPort',
        })

        if (withAnotherPort) {
          do {
            if (await portIsAvailable((this.table.port += 1), this.table.host)) break
          } while (!(await portIsAvailable(this.table.port, this.table.host)))
        } else this.table.start = false
      }

      if (this.table.start)
        this.spawns.table = new Spawn(
          [
            'npx azurite-table',
            '--tablePort',
            this.table.port,
            '--tableHost',
            this.table.host,
            { location },
          ],
          {
            cwd: output,
          },
        )
    }
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

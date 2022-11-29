/* eslint-disable @typescript-eslint/no-confusing-void-expression */
/* eslint-disable object-shorthand */
/* eslint-disable max-lines-per-function */
import { ApplicationConfiguration } from '@bluish/core'
import path from 'path'
import { Configuration as IConfiguration } from '../interfaces/Configuration'
import { TriggerBuilderCollection as TriggersBuilder } from './TriggerBuilderCollection'
import { AzureServer } from './AzureServer'
import fs from 'fs/promises'
import { Configuration } from './Configuration'
import { _import } from '../tools/_import'
import { ChokidarWatcher } from './ChokidarWatcher'
import TypescriptBuilder from '../builders/typescript'

export interface DevServerOptions {
  input: string
  port: number
  output: string
  configuration: IConfiguration
}

export class DevServer {
  public azureServer: AzureServer
  public builder: TypescriptBuilder
  public triggersBuilder: TriggersBuilder
  public configuration: Configuration
  public functionsWatcher: ChokidarWatcher

  constructor(public options: DevServerOptions) {
    const { input, output, port } = this.options

    const bluishConfiguration = this.options.configuration

    this.configuration = new Configuration({ input, output }, bluishConfiguration)

    this.azureServer = new AzureServer(
      { port },
      {
        asleep: true,
        cwd: output,
        stdio: [process.stdin, process.stdout, process.stderr, 'pipe'],
      },
    )
    this.builder = new TypescriptBuilder(input, output)

    this.triggersBuilder = new TriggersBuilder(this.builder, this.configuration)

    this.functionsWatcher = new ChokidarWatcher(this.options.configuration.functions, {
      cwd: input,
    })
  }

  protected clearInputModules() {
    Object.keys(require.cache)
      .filter((module) => module.includes(this.options.input))
      .forEach((module) => {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete require.cache[module]
      })
  }

  private async getApplicationConfiguration(bluishConfiguration: IConfiguration) {
    const { input } = this.options

    return _import<Function>(
      bluishConfiguration.application && path.join(input, bluishConfiguration.application),
    ).then((app) => ApplicationConfiguration.set(app))
  }

  public async start() {
    const { input, output } = this.options

    const applicationConfiguration = await this.getApplicationConfiguration(
      this.options.configuration,
    )

    await fs.writeFile(
      path.join(output, 'host.json'),
      JSON.stringify(applicationConfiguration.host.set({ version: '2.0' }), null, 2),
    )

    this.builder.startWatch()

    this.functionsWatcher.on('change', () => {
      this.clearInputModules()
    })

    this.functionsWatcher.on('add', async (filepath) => {
      const module = await _import<Record<string, Function>>(path.join(input, filepath))

      await this.triggersBuilder.addByModuleExportAndBuild(module)
    })

    this.functionsWatcher.on('change', async (filepath) => {
      const module = await _import<Record<string, Function>>(path.join(input, filepath))

      await this.triggersBuilder.removeByFilePath(path.join(input, filepath))

      await this.triggersBuilder.addByModuleExportAndBuild(module)
    })

    this.functionsWatcher.on('unlink', async (filepath) => {
      await this.triggersBuilder.removeByFilePath(path.join(input, filepath))
    })

    this.functionsWatcher.start()

    this.azureServer.toWakeUp()
  }

  public async close() {
    await this.azureServer.kill()
    this.builder.stopWatch()
    await this.functionsWatcher.close()
  }
}

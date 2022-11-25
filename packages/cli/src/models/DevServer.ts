import { ApplicationMetadata } from '@bluish/core'
import path from 'path'
import { Configuration as IConfiguration } from '../interfaces/Configuration'
import { exists } from '../tools/exists'
import { TriggerBuilderCollection as TriggersBuilder } from './TriggerBuilderCollection'
import { AzureFuncSpawn } from './AzureFuncSpawn'
import fs from 'fs/promises'
import { Configuration } from './Configuration'
import { _import } from '../tools/_import'
import { ChokidarWatcher } from './ChokidarWatcher'

export interface DevServerOptions {
  input: string
  config: string
  port: number
  output: string
}

export class DevServer {
  public bluishConfigurationPath: string

  private _kill: null | (() => Promise<void>) = null

  constructor(public options: DevServerOptions) {
    this.bluishConfigurationPath = path.resolve(this.options.input, this.options.config)
  }

  protected async getBluishConfiguration() {
    if (!(await exists(this.bluishConfigurationPath))) throw new Error('')

    return _import<IConfiguration>(this.bluishConfigurationPath)
  }

  protected clearInputModules() {
    Object.keys(require.cache)
      .filter((module) => module.includes(this.options.input))
      .forEach((module) => {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete require.cache[module]
      })
  }

  private async getApplication(bluishConfiguration: IConfiguration) {
    const { input } = this.options

    return _import<Function>(
      bluishConfiguration.application && path.join(input, bluishConfiguration.application),
    ).then((app) => ApplicationMetadata.set(app))
  }

  public async start() {
    const { input, output, port } = this.options

    const bluishConfiguration = await this.getBluishConfiguration()

    const configuration = new Configuration({ input, output }, bluishConfiguration)

    const application = await this.getApplication(bluishConfiguration)

    application.host.set({ version: '2.0' })

    const { default: TypescriptBuilder } = await import('../builders/typescript')

    const builder = new TypescriptBuilder(input, output)
    const triggersBuilder = new TriggersBuilder(builder, configuration)

    await fs.writeFile(path.join(output, 'host.json'), JSON.stringify(application.host, null, 2))

    const watchers = {
      builder: builder.watch(),
      functions: new ChokidarWatcher(bluishConfiguration.functions, { cwd: input }),
    }
    watchers.functions.on('change', () => {
      this.clearInputModules()
    })
    watchers.functions.on('add', async (filepath) => {
      const module = await _import<Record<string, Function>>(path.join(input, filepath))

      await triggersBuilder.addByModuleExportAndBuild(module)
    })
    watchers.functions.on('change', async (filepath) => {
      const module = await _import<Record<string, Function>>(path.join(input, filepath))

      await triggersBuilder.removeByFilePath(path.join(input, filepath))

      await triggersBuilder.addByModuleExportAndBuild(module)
    })
    watchers.functions.on('unlink', async (filepath) => {
      await triggersBuilder.removeByFilePath(path.join(input, filepath))
    })

    const fork = new AzureFuncSpawn('start', { cwd: output, flags: { port }, stdio: true })

    this._kill = async () => {
      fork.kill()
      watchers.builder()
      await watchers.functions.close()
      await fs.rm(output, { force: true, recursive: true })
    }
  }

  public async kill() {
    await this._kill?.()

    this._kill = null
  }
}

/* eslint-disable @typescript-eslint/no-dynamic-delete */
/* eslint-disable @typescript-eslint/no-misused-promises */
import path from 'path'
import os from 'os'
import fs from 'fs/promises'
import { randomUUID } from 'crypto'

import { Command } from 'commander'
import { Driver } from '@bluish/core'
import { AsynchronousCascadeArray } from 'asynchronous-cascade-array'
import { render } from 'ink'
import appRoot from 'app-root-path'

import TypeScriptBuilder from '../../helpers/TypeScriptBuilder.js'
import { Configuration } from '../../models/Configuration.js'
import { FileWatcher } from '../../models/FileWatcher/index.js'
import { Collection } from '../../models/Collection.js'
import {
  StartUI,
  type StartUIStateServer,
  type StartUIState,
  StartUIStateSourceStatus,
} from './StartUI.js'
import { Store } from '../../helpers/Store.js'

interface StartOptions {
  config?: string
  port: number
  source: string
  functions: string[]
  drivers: string[]
  servers?: string[]
  preset?: string
  application?: string
}

export default new Command('start')
  .option('-c, --config <path>', '', value => path.resolve(value))
  .option<string[]>(
    '-f, --functions <path>',
    '',
    (value, previous) => previous.concat(value),
    [],
  )
  .option<string[]>(
    '-d, --drivers <path or module>',
    '',
    (value, previous) => previous.concat(value),
    [],
  )
  .option<string[]>(
    '-F, --frames <path or module>',
    '',
    (value, previous) => previous.concat(value),
    [],
  )
  .option('-a, --application <path>', '')
  .option('-s, --servers <path or module>', '')
  .option('-p, --preset <path or module>', '')
  .option('--source <path>', '', value => path.resolve(value), path.resolve())
  .action(async (opts: StartOptions) => {
    const store = new Store<StartUIState>({
      servers: [],
      logs: [],
      outputDirectory: null,
      sources: [],
    })

    const { unmount } = render(<StartUI store={store} />)

    const configuration = await Configuration.load({
      sourceDirectory: opts.source,
      outputDirectory: await fs.mkdtemp(path.join(os.tmpdir(), 'bluish-')),
      drivers: opts.drivers,
      functions: opts.functions,
      configuration: opts.config,
      preset: opts.preset,
      servers: opts.servers,
      application: opts.application,
    })

    store.setState(state => ({
      ...state,
      servers: configuration.servers.map(server => ({
        id: server.id,
        name: server.name,
        logs: [],
      })),
      outputDirectory: configuration.outputDirectory,
    }))

    if (!configuration.drivers.length) throw new Error(`No drivers found`)
    if (!configuration.functions.length) throw new Error(`No functions found`)

    const builder = new TypeScriptBuilder(configuration)

    const log = (text: string): void => {
      store.setState(state => ({
        ...state,
        logs: [...state.logs, { id: randomUUID(), type: 'text', text }],
      }))
    }

    builder.startWatch()

    if (configuration.application) {
      Driver.application = {
        source: path.join(
          configuration.sourceDirectory,
          configuration.application,
        ),
        dist: await builder.find(
          path.join(configuration.sourceDirectory, configuration.application),
        ),
        exportName: 'default',
        exportAlias: 'Application',
      }
    }

    const fileWatcher = new FileWatcher(configuration.functions, {
      rootDirectory: configuration.sourceDirectory,
    })

    const collection = new Collection(builder)

    const stat = (
      sourceName: string,
      status: StartUIStateSourceStatus,
    ): void => {
      store.setState(state => {
        if (!state.sources.some(source => source.id === sourceName))
          return {
            ...state,
            sources: [
              ...state.sources,
              {
                id: sourceName,
                name: sourceName,
                status,
              },
            ],
          }

        return {
          ...state,
          sources: state.sources.map(source => {
            if (source.id !== sourceName) return source

            return { ...source, status }
          }),
        }
      })
    }

    collection.on('before:source-trigger-binder:up', event => {
      const sourceName = `${event.sourceTriggerBinder.sourceTriggerMetadata.sourceMetadata.target.name}.${event.sourceTriggerBinder.sourceTriggerMetadata.propertyKey}`
      log(`[source] ${sourceName} up start`)
      stat(sourceName, StartUIStateSourceStatus.Creating)
    })

    collection.on('after:source-trigger-binder:up', event => {
      const sourceName = `${event.sourceTriggerBinder.sourceTriggerMetadata.sourceMetadata.target.name}.${event.sourceTriggerBinder.sourceTriggerMetadata.propertyKey}`
      log(`[source] ${sourceName} up finish`)
      stat(sourceName, StartUIStateSourceStatus.Idle)
    })

    collection.on('before:source-trigger-binder:down', event => {
      const sourceName = `${event.sourceTriggerBinder.sourceTriggerMetadata.sourceMetadata.target.name}.${event.sourceTriggerBinder.sourceTriggerMetadata.propertyKey}`
      log(`[source] ${sourceName} down start`)
      stat(sourceName, StartUIStateSourceStatus.Destroying)
    })

    collection.on('after:source-trigger-binder:down', event => {
      const sourceName = `${event.sourceTriggerBinder.sourceTriggerMetadata.sourceMetadata.target.name}.${event.sourceTriggerBinder.sourceTriggerMetadata.propertyKey}`
      log(`[source] ${sourceName} down finish`)
      store.setState(state => {
        return {
          ...state,
          sources: state.sources.filter(source => source.id !== sourceName),
        }
      })
    })

    await fs.symlink(
      path.join(appRoot.path, 'node_modules'),
      path.join(configuration.outputDirectory, 'node_modules'),
    )

    await fs.symlink(
      path.join(configuration.sourceDirectory, 'package.json'),
      path.join(configuration.outputDirectory, 'package.json'),
    )

    // await AsynchronousCascadeArray.from(
    //   fs.readdir(configuration.sourceDirectory, { withFileTypes: true }),
    // )
    //   .filter(dirent => dirent.isFile())
    //   .forEach(async dirent => {
    //     await fs.symlink(
    //       path.join(configuration.sourceDirectory, dirent.name),
    //       path.join(configuration.outputDirectory, dirent.name),
    //     )
    //   })

    fileWatcher.onAdd(async event => {
      log(`file add ${event.target}`)

      await collection.addBySourcePath(event.target)
    })

    fileWatcher.onReady(async event => {
      log(`file watcher ready`)

      await AsynchronousCascadeArray.from(configuration.frames).forEach(
        async frame => await frame.fresh?.(),
      )
    })

    fileWatcher.onChange(async event => {
      log(`file change ${event.target}`)

      Object.keys(require.cache)
        .filter(
          module =>
            (module.includes(configuration.sourceDirectory) ||
              module.includes(configuration.outputDirectory)) &&
            !module.includes('node_modules'),
        )
        .forEach(module => {
          delete require.cache[module]
        })

      await collection.removeBySourcePath(event.target)

      await collection.addBySourcePath(event.target)

      await AsynchronousCascadeArray.from(configuration.frames).forEach(
        async frame => await frame.fresh?.(),
      )
    })

    fileWatcher.onUnlink(async event => {
      log(`file remove ${event.target}`)

      await collection.removeBySourcePath(event.target)

      await AsynchronousCascadeArray.from(configuration.frames).forEach(
        async frame => await frame.fresh?.(),
      )
    })

    process.on('uncaughtException', exception => {
      unmount()
      console.error(exception.stack)
      process.exit(1)
    })

    await Promise.all(
      configuration.frames.map(async frame => await frame.up?.()),
    )

    await Promise.all(
      configuration.servers.map(async server => {
        const serverId = server.id

        server.on('log', event => {
          store.setState(state => ({
            ...state,
            servers: state.servers.map((server): StartUIStateServer => {
              if (server.id !== serverId) return server
              return {
                ...server,
                logs: [
                  ...server.logs,
                  { id: randomUUID(), type: 'text', text: event.target },
                ],
              }
            }),
          }))
        })

        server.on('progress:start', event => {
          store.setState(state => ({
            ...state,
            logs: [
              ...state.logs,
              {
                id: event.identifier,
                current: event.initWith,
                total: event.total,
                type: 'progress',
                label: event.label,
              },
            ],
          }))
        })

        server.on('progress:increment', event => {
          store.setState(state => ({
            ...state,
            logs: state.logs.map(log => {
              if (log.id !== event.target) return log
              if (log.type !== 'progress') return log
              return { ...log, current: log.current + event.increment }
            }),
          }))
        })

        await server.start()
      }),
    )
  })

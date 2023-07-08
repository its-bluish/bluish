import path from 'path'

import { Driver, Frame, type SourceTriggerBinder } from '@bluish/core'
import { AsynchronousCascadeArray } from 'asynchronous-cascade-array'

import { readFileConfiguration } from '../tools/readFileConfiguration.js'
import { Server } from './Server/index.js'
import { isConstructorOf } from '../tools/isConstructorOf.js'
import { _import } from '../tools/_import.js'

export interface ConfigurationRawInput {
  sourceDirectory: string
  outputDirectory: string
  drivers?: string[]
  functions?: string[]
  servers?: string[]
  preset?: string
  configuration?: string
  application?: string
  frames?: string[]
}

export interface ConfigurationInput {
  sourceDirectory: string
  outputDirectory: string
  drivers: Array<Driver<SourceTriggerBinder>>
  frames: Frame[]
  functions: string[]
  servers: Server[]
  application: string | null
}

export class Configuration {
  public readonly servers: Server[]
  public readonly drivers: Array<Driver<SourceTriggerBinder>>
  public readonly frames: Frame[]
  public readonly functions: string[]
  public readonly application: string | null
  public readonly sourceDirectory: string
  public readonly outputDirectory: string

  public static async load({
    sourceDirectory,
    outputDirectory,
    preset: presetPath,
    configuration: configurationPath,
    drivers: driversPaths = [],
    functions = [],
    frames: framesPaths = [],
    servers: serverPaths = [],
    application,
  }: ConfigurationRawInput): Promise<Configuration> {
    if (configurationPath) {
      const configuration = await readFileConfiguration<
        Partial<ConfigurationRawInput>
      >(configurationPath)

      presetPath ??= configuration.preset

      if (configuration.servers) serverPaths.push(...configuration.servers)

      if (Array.isArray(configuration.drivers))
        driversPaths.push(...configuration.drivers)

      if (Array.isArray(configuration.functions))
        functions.push(...configuration.functions)

      if (Array.isArray(configuration.frames))
        framesPaths.push(...configuration.frames)
    }

    if (presetPath) {
      const { default: preset } = await _import(presetPath, sourceDirectory)

      if (preset.servers) serverPaths.push(...preset.servers)

      if (Array.isArray(preset.drivers)) driversPaths.push(...preset.drivers)
      if (Array.isArray(preset.functions)) functions.push(...preset.functions)
      if (Array.isArray(preset.frames)) framesPaths.push(...preset.frames)
    }

    if (!serverPaths) throw new Error('Not found `server` configuration')

    const servers = await AsynchronousCascadeArray.from(serverPaths).flatMap(
      async serverPath => {
        const module = await _import(serverPath, sourceDirectory)

        return Object.values(module)
          .filter(isConstructorOf.factory(Server))
          .map(Server => new Server())
      },
    )

    const drivers = await new AsynchronousCascadeArray(driversPaths).flatMap(
      async pathOrPackageName => {
        const module = pathOrPackageName.startsWith('./')
          ? await import(path.resolve(sourceDirectory, pathOrPackageName))
          : await import(pathOrPackageName)

        return Object.values(module)
          .filter(isConstructorOf.factory(Driver))
          .map(Driver =>
            Object.assign(new Driver(), { outputDirectory, sourceDirectory }),
          )
      },
    )

    const frames = await new AsynchronousCascadeArray(framesPaths).flatMap(
      async pathOrPackageName => {
        const module = pathOrPackageName.startsWith('./')
          ? await import(path.resolve(sourceDirectory, pathOrPackageName))
          : await import(pathOrPackageName)

        return Object.values(module)
          .filter(isConstructorOf.factory(Frame))
          .map(Frame =>
            Object.assign(new Frame(), { outputDirectory, sourceDirectory }),
          )
      },
    )

    return new this({
      sourceDirectory,
      outputDirectory,
      drivers,
      frames,
      functions,
      servers,
      application: application ?? null,
    })
  }

  protected constructor({
    sourceDirectory,
    outputDirectory,
    drivers,
    frames,
    functions,
    servers,
    application,
  }: ConfigurationInput) {
    this.application = application
    this.sourceDirectory = sourceDirectory
    this.outputDirectory = outputDirectory
    this.drivers = drivers.map(driver =>
      Object.assign(driver, {
        useFrame: (frameConstructor: any) => {
          const frame = this.frames.find(
            frame => frame instanceof frameConstructor,
          )

          if (!frame) throw new Error('TODO')

          return frame
        },
      }),
    )
    this.frames = frames
    this.functions = functions
    this.servers = servers.map(server =>
      Object.assign(server, { configuration: this }),
    )
  }
}

import path from "path"
import { Builder } from "./Builder"
import globCallback from 'glob'
import { promisify } from 'util'
import { Metadata } from '@bluish/core'
import { MODULE_EXPORT_NAME } from "../constants"

const glob = promisify(globCallback)

export interface ConfigurationOptions {
  input: string
  output: string
}

export interface BluishConfiguration {
  application?: string
  functions?: string | string[]
  builder?: string
}

const DEFAULT_APPLICATION = '@bluish/core'

export class Configuration {
  public static async from(input: string, filename: string, output: string) {
    const maybeConfig = await import(path.resolve(input, filename))
    const config = maybeConfig.default ?? maybeConfig ?? {}

    return new this({ input, output }, config)
  }

  constructor(protected options: ConfigurationOptions, protected configuration: BluishConfiguration) {}

  public get input() {
    return this.options.input
  }

  public get output() {
    return this.options.output
  }

  public get builder() {
    return this.configuration.builder ?? 'typescript'
  }

  public get application() {
    return this.configuration.application
      ? path.resolve(this.options.input, this.configuration.application)
      : DEFAULT_APPLICATION
  }

  public async getApplication(): Promise<Function | null> {
    const { default: Application } = await import(this.application)

    return Application ?? null
  }

  public get globs(): string[] {
    if (!this.configuration.functions) return []

    return Array.isArray(this.configuration.functions) ? this.configuration.functions : [this.configuration.functions]
  }

  public async getTriggers() {
    if (!this.configuration.functions) return []

    const { globs } = this

    const files = await Promise.all(globs.map(pattern => glob(path.join(this.input, pattern))))

    const classes = await Promise.all(
      files.flat(1).map(async file => {
        const module = await import(file)

        const functions = Object.entries<Function>(module)

        return functions.map(([functionExportName, func]) => Object.assign(func, { [MODULE_EXPORT_NAME]: functionExportName }))
      })
    )

    return classes.flat()
      .flatMap((func) => Metadata.load(func)?.triggers.toArray())
      .filter(<T>(item: T): item is Exclude<T, undefined> => !!item)
  }

  public async createBuilder() {
    const { default: Builder } = await import(`../builders/${this.builder}`)

    return new Builder(this.input, this.output) as Builder
  }
}

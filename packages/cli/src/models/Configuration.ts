import path from 'path'
import { Builder } from './Builder'
import { _import } from '../tools/_import'

export interface ConfigurationOptions {
  input: string
  output: string
}

export interface BluishConfiguration {
  application?: string
  functions?: string | string[]
  builder?: string
}

export class Configuration {
  public static async from(input: string, filename: string, output: string) {
    const config = await _import<BluishConfiguration>(path.resolve(input, filename))

    return new this({ input, output }, config)
  }

  constructor(
    protected options: ConfigurationOptions,
    protected configuration: BluishConfiguration,
  ) {}

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
    return (
      this.configuration.application &&
      path.resolve(this.options.input, this.configuration.application)
    )
  }

  public async getApplication(): Promise<Function | null> {
    return _import<Function>(this.application)
  }

  public get globs(): string[] {
    if (!this.configuration.functions) return []

    return Array.isArray(this.configuration.functions)
      ? this.configuration.functions
      : [this.configuration.functions]
  }

  public async createBuilder() {
    const BuilderConstructor = await _import<new (input: string, output: string) => Builder>(
      path.join(__dirname, '..', 'builders', this.builder),
    )

    return new BuilderConstructor(this.input, this.output)
  }
}

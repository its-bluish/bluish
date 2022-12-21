import { TriggerConfiguration } from './TriggerConfiguration'
import { ApplicationConfiguration } from './ApplicationConfiguration'
import { Hook } from './Hook'
import { AzureFunctionContext, Context } from './contexts/Context'
import { Source } from './Source'
import { Fn } from '../typings/helpers'
import { HookCollectionSequencer } from '../helpers/HookCollectionSequencer'

export class Runner<P extends string, T extends Record<P, Fn>> {
  public instance!: Record<P, Fn> & Record<string, unknown>
  public application: Record<string, unknown>
  public applicationConfiguration: ApplicationConfiguration
  public triggerConfiguration: TriggerConfiguration
  public source: Source

  constructor(
    public RootConstructor: new () => T,
    public property: P,
    public Application: (new () => unknown) | null = null,
  ) {
    const application = Application ? new Application() : {}

    if (typeof application !== 'object')
      throw new Error('The application instance must be an object')

    this.application = application as Record<string, unknown>

    this.applicationConfiguration = ApplicationConfiguration.set(Application)

    this.source = Source.getOrFail(RootConstructor)

    this.triggerConfiguration = this.source.triggers.findOneByPropertyOrFail(property)

    this.instance = new RootConstructor()

    if (typeof this.instance !== 'object')
      throw new Error(`The source instance ${this.RootConstructor.name} must be an object`)

    if (!(this.property in this.instance))
      throw new Error(
        `The source instance '${this.RootConstructor.name}' must contain the property defined as trigger '${this.property}'`,
      )

    if (typeof this.instance[this.property] !== 'function')
      throw new Error(
        `The trigger type defined in the source instance must be a function '${this.RootConstructor.name}${this.property}'`,
      )
  }

  public async run(context: Context) {
    const args = await this.triggerConfiguration.args.toArguments(context)

    return this.instance[this.property](...args) as unknown
  }

  private static _hook(target: Record<string, unknown>, hook: Hook, ...args: unknown[]): unknown {
    if (typeof hook.call === 'function') return hook.call(...args)

    if (typeof target[hook.call] !== 'function')
      throw new Error(
        `Cannot call hook as property does not exist in source or application '${target.constructor.name}.${hook.call}' '${hook.event}'`,
      )

    return (target[hook.call] as Fn)(...args)
  }

  private async _initialize(context: Context) {
    await context.initialize?.()

    await HookCollectionSequencer.callByEvent('initialize', [
      [this.applicationConfiguration.hooks, this.application],
      [this.source.hooks, this.instance],
      [this.triggerConfiguration.hooks, {}],
    ])
  }

  private async _destroy(context: Context) {
    await HookCollectionSequencer.callByEvent(
      'destroy',
      [
        [this.triggerConfiguration.hooks, {}],
        [this.source.hooks, this.instance],
        [this.applicationConfiguration.hooks, this.application],
      ],
      context,
    )

    await context.destroy?.()
  }

  private async _error(error: unknown, context: Context) {
    return HookCollectionSequencer.getFirstReturnByEvent(
      'error',
      [
        [this.triggerConfiguration.hooks, {}],
        [this.source.hooks, this.instance],
        [this.applicationConfiguration.hooks, this.application],
      ],
      error,
      context,
    )
  }

  private async _success(initialData: unknown, context: Context) {
    return HookCollectionSequencer.reduceArgumentByEvent(
      'success',
      [
        [this.triggerConfiguration.hooks, {}],
        [this.source.hooks, this.instance],
        [this.applicationConfiguration.hooks, this.application],
      ],
      initialData,
      context,
    )
  }

  private async _run(azureFunctionContext: AzureFunctionContext, ...args: unknown[]) {
    const context = Object.assign(
      new this.triggerConfiguration.Context(azureFunctionContext, ...args),
      {
        runner: this,
      },
    )

    return this.runWithContext(context)
  }

  public async runWithContext(context: Context) {
    try {
      await this._initialize(context)

      const data = await this._success(await this.run(context), context)

      const response = await context.success(data)

      return response
    } catch (error) {
      const maybeHandleErrorPayload = await this._error(error, context)

      if (maybeHandleErrorPayload !== null && maybeHandleErrorPayload !== void 0) {
        const response = await context.handledError(maybeHandleErrorPayload)

        return response
      }

      const response = await context.unhandledError(error)

      return response
    } finally {
      await this._destroy(context)
    }
  }

  public toAzureFunction() {
    return async (azureFunctionContext: AzureFunctionContext, ...args: unknown[]) =>
      this._run(azureFunctionContext, ...args)
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Runner<P extends string, T extends Record<P, Fn>> {
  constructor: typeof Runner
}

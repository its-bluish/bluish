/* eslint-disable no-await-in-loop */
import { TriggerConfiguration } from './TriggerConfiguration'
import { ApplicationConfiguration } from './ApplicationConfiguration'
import { Hook } from './Hook'
import { AzureFunctionContext, Context } from './contexts/Context'
import { Source } from './Source'
import { Fn } from '../typings/helpers'

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

    for (const plugin of this.applicationConfiguration.plugins) await plugin.onInitialize?.(context)

    for (const hook of this.applicationConfiguration.hooks.findByEvent('initialize'))
      await this.constructor._hook(this.application, hook, context)

    for (const plugin of this.source.plugins) await plugin.onInitialize?.(context)

    for (const hook of this.source.hooks.findByEvent('initialize'))
      await this.constructor._hook(this.instance, hook, context)

    for (const plugin of this.triggerConfiguration.plugins) await plugin.onInitialize?.(context)

    for (const hook of this.triggerConfiguration.hooks.findByEvent('initialize'))
      await this.constructor._hook({}, hook, context)
  }

  private async _destroy(context: Context) {
    for (const hook of this.triggerConfiguration.hooks.findByEvent('destroy'))
      await this.constructor._hook({}, hook, context)

    for (const plugin of this.triggerConfiguration.plugins) await plugin.onDestroy?.(context)

    for (const hook of this.source.hooks.findByEvent('destroy'))
      await this.constructor._hook(this.instance, hook, context)

    for (const plugin of this.source.plugins) await plugin.onDestroy?.(context)

    for (const hook of this.applicationConfiguration.hooks.findByEvent('destroy'))
      await this.constructor._hook(this.application, hook, context)

    for (const plugin of this.applicationConfiguration.plugins) await plugin.onDestroy?.(context)

    await context.destroy?.()
  }

  private async _error(error: unknown, context: Context) {
    for (const hook of this.triggerConfiguration.hooks.findByEvent('error')) {
      const data = await this.constructor._hook({}, hook, error, context)

      if (data !== void 0) return data
    }

    for (const plugin of this.triggerConfiguration.plugins) {
      const data = await plugin.onError?.(error, context)

      if (data !== void 0) return data
    }

    for (const hook of this.source.hooks.findByEvent('error')) {
      const data = await this.constructor._hook(this.instance, hook, error, context)

      if (data !== void 0) return data
    }

    for (const plugin of this.source.plugins) {
      const data = await plugin.onError?.(error, context)

      if (data !== void 0) return data
    }

    for (const hook of this.applicationConfiguration.hooks.findByEvent('error')) {
      const data = await this.constructor._hook(this.application, hook, error, context)

      if (data !== void 0) return data
    }

    for (const plugin of this.applicationConfiguration.plugins) {
      const data = await plugin.onError?.(error, context)

      if (data !== void 0) return data
    }

    return null
  }

  private async _success(initialData: unknown, context: Context) {
    let data: unknown = initialData

    data = await this.triggerConfiguration.hooks
      .findByEvent('success')
      .reduce(
        async (current, hook) =>
          (await this.constructor._hook({}, hook, await current, context)) ?? current,
        Promise.resolve(data),
      )

    data = await this.triggerConfiguration.plugins
      .toArray()
      .reduce(
        async (current, plugin) => (await plugin.onSuccess?.(await current, context)) ?? current,
        Promise.resolve(data),
      )

    data = await this.source.hooks
      .findByEvent('success')
      .reduce(
        async (current, hook) =>
          (await this.constructor._hook(this.instance, hook, await current, context)) ?? current,
        Promise.resolve(data),
      )

    data = await this.source.plugins
      .toArray()
      .reduce(
        async (current, plugin) => (await plugin.onSuccess?.(await current, context)) ?? current,
        Promise.resolve(data),
      )

    data = await this.applicationConfiguration.hooks
      .findByEvent('success')
      .reduce(
        async (current, hook) =>
          (await this.constructor._hook(this.application, hook, await current, context)) ?? current,
        Promise.resolve(data),
      )

    data = await this.applicationConfiguration.plugins
      .toArray()
      .reduce(
        async (current, plugin) => (await plugin.onSuccess?.(await current, context)) ?? current,
        Promise.resolve(data),
      )

    return data
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

      if (maybeHandleErrorPayload !== null) {
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

/* eslint-disable no-await-in-loop */
import { Trigger } from './metadata/Trigger'
import { ApplicationMetadata } from './metadata/Application'
import { Hook } from './metadata/Hook'
import { AzureFunctionContext, Context } from './contexts/Context'
import { Metadata } from './metadata'
import { wait } from '../tools/wait'
import { Fn } from '../typings/helpers'

export class Runner<P extends string, T extends Record<P, Fn>> {
  public instance!: Record<P, Fn> & Record<string, unknown>
  public application: Record<string, unknown>
  public applicationMetadata: ApplicationMetadata
  public trigger: Trigger
  public metadata: Metadata

  constructor(
    public TargetConstructor: new () => T,
    public property: P,
    public Application: (new () => unknown) | null = null,
  ) {
    const application = Application ? new Application() : {}

    if (typeof application !== 'object') throw new Error('TODO')

    this.application = application as Record<string, unknown>

    this.applicationMetadata = ApplicationMetadata.set(Application)

    this.metadata = Metadata.loadOrFail(TargetConstructor)

    this.trigger = this.metadata.triggers.findOneByPropertyOrFail(property)

    const instance = new TargetConstructor()

    if (typeof instance !== 'object') throw new Error('TODO')

    if (!(this.property in instance)) throw new Error('TODO')

    this.instance = instance as Record<P, Fn> & Record<string, unknown>
  }

  protected get plugins() {
    return [...this.applicationMetadata.plugins, ...this.metadata.plugins, ...this.trigger.plugins]
  }

  public async run(context: Context) {
    const args = await this.trigger.args.toArguments(context)

    if (!(this.property in this.instance)) throw new Error('TODO')

    if (typeof this.instance[this.property] !== 'function') throw new Error('TODO')

    return this.instance[this.property](...args) as unknown
  }

  private static _hook(target: Record<string, unknown>, hook: Hook, ...args: unknown[]): unknown {
    if (typeof hook.call === 'function') return hook.call(...args)

    if (typeof target[hook.call] !== 'function') throw new Error('TODO')

    return (target[hook.call] as Fn)(...args)
  }

  private async _hooks(event: string, ...args: unknown[]) {
    for (const hook of this.applicationMetadata.hooks.findByEvent(event))
      await this.constructor._hook(this.application, hook, ...args)

    for (const hook of this.metadata.hooks.findByEvent(event))
      await this.constructor._hook(this.instance, hook, ...args)

    for (const hook of this.trigger.hooks.findByEvent(event))
      await this.constructor._hook({}, hook, ...args)
  }

  private async _initialize(context: Context) {
    await context.initialize?.()

    for (const plugin of this.plugins) await plugin.onInitialize?.(context)

    await this._hooks('initialize', context)
  }

  private async _destroy(context: Context) {
    for (const plugin of this.plugins) await plugin.onDestroy?.(context)

    await this._hooks('destroy', context)

    await context.destroy?.()
  }

  private async _error(error: unknown, context: Context) {
    for (const plugin of this.plugins) await plugin.onError?.(error, context)

    await this._hooks('error', error, context)
  }

  private async _handleError(error: unknown, context: Context) {
    for (const hook of this.trigger.hooks.findByEvent('error-handler')) {
      const data = await this.constructor._hook({}, hook, error, context)

      if (data !== void 0) return data
    }

    for (const hook of this.metadata.hooks.findByEvent('error-handler')) {
      const data = await this.constructor._hook(this.instance, hook, error, context)

      if (data !== void 0) return data
    }

    for (const hook of this.applicationMetadata.hooks.findByEvent('error-handler')) {
      const data = await this.constructor._hook(this.application, hook, error, context)

      if (data !== void 0) return data
    }

    return null
  }

  private async _transform(initialData: unknown, context: Context) {
    let data: unknown = initialData

    data = await this.plugins.reduce(
      async (current, plugin) => (await plugin.transform?.(await current, context)) ?? current,
      Promise.resolve(data),
    )

    data = await this.metadata.hooks
      .findByEvent('transform')
      .reduce(
        async (current, hook) =>
          (await this.constructor._hook(this.instance, hook, await current, context)) ?? current,
        Promise.resolve(data),
      )

    data = await this.trigger.hooks
      .findByEvent('transform')
      .reduce(
        async (current, hook) =>
          (await this.constructor._hook({}, hook, await current, context)) ?? current,
        Promise.resolve(data),
      )

    return data
  }

  private async _run(azureFunctionContext: AzureFunctionContext, ...args: unknown[]) {
    await wait.cleaning()

    const context = Object.assign(new this.trigger.Context(azureFunctionContext, ...args), {
      runner: this,
    })

    try {
      await this._initialize(context)

      const data = await this._transform(await this.run(context), context)

      const response = await context.success(data)

      return response
    } catch (error) {
      await this._error(error, context)

      const maybeHandleErrorPayload = await this._handleError(error, context)

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

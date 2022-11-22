import { Trigger } from './metadata/Trigger';
import { ApplicationMetadata } from './metadata/Application';
import { Hook } from './metadata/Hook';
import { AzureFunctionContext, Context } from "./contexts/Context";
import { Metadata } from './metadata';
import { wait } from '../tools/wait';

type Class<R = any, A extends any[] = any[]> = new (...args: A) => R

export class Runner {
  public instance!: Record<string, Function>
  public application: Record<string, Function>
  public applicationMetadata: ApplicationMetadata
  public trigger: Trigger
  public metadata: Metadata

  constructor(
    public targetConstructor: Class,
    public property: string,
    public applicationConstructor: Class | null = null
  ) {
    this.application = applicationConstructor ? new applicationConstructor() : {}

    this.applicationMetadata = ApplicationMetadata.set(applicationConstructor)

    this.metadata = Metadata.loadOrFail(targetConstructor)

    this.trigger = this.metadata.triggers.findOneByPropertyOrFail(property)

    this.instance = new targetConstructor()
  }

  protected get plugins() {
    return [
      ...this.applicationMetadata.plugins,
      ...this.metadata.plugins,
      ...this.trigger.plugins,
    ]
  }

  public async run(context: Context) {
    return await this.instance[this.property].apply(
      this.instance,
      await this.trigger.args.toArguments(context)
    )
  }

  private async _hook(target: Record<string, Function>, hook: Hook, ...args: unknown[]) {
    if (typeof hook.call === 'function') return await hook.call(...args)

    return await target[hook.call].call(target, ...args)
  }

  private async _hooks(event: string, ...args: unknown[]) {
    for (const hook of this.applicationMetadata.hooks.findByEvent(event))

      await this._hook(this.application, hook, ...args)

    for (const hook of this.metadata.hooks.findByEvent(event))

      await this._hook(this.instance, hook, ...args)

    for (const hook of this.trigger.hooks.findByEvent(event))

      await this._hook({}, hook, ...args)
  }

  private async _initialize(context: Context) {
    await context.initialize()

    for (const plugin of this.plugins) await plugin.onInitialize(context)

    await this._hooks('initialize', context)
  }

  private async _destroy(context: Context) {
    for (const plugin of this.plugins) await plugin.onDestroy(context)

    await this._hooks('destroy', context)

    await context.destroy()
  }

  private async _error(error: unknown, context: Context) {
    for (const plugin of this.plugins) await plugin.onError(error, context)

    await this._hooks('error', error, context)
  }

  private async _handleError(error: unknown, context: Context) {
    for (const hook of this.trigger.hooks.findByEvent('error-handler')) {
      const data = await this._hook({}, hook, error, context)

      if (data !== undefined) return data
    }

    for (const hook of this.metadata.hooks.findByEvent('error-handler')) {
      const data = await this._hook(this.instance, hook, error, context)

      if (data !== undefined) return data
    }

    for (const hook of this.applicationMetadata.hooks.findByEvent('error-handler')) {
      const data = await this._hook(this.application, hook, error, context)

      if (data !== undefined) return data
    }
  }

  private async _transform(data: unknown, context: Context) {
    data = await this.plugins
      .reduce(async (data, plugin) => await plugin.transform(await data, context) ?? data, Promise.resolve(data))

    data = await this.metadata
      .hooks
      .findByEvent('transform')
      .reduce(async (data, hook) => await this._hook(this.instance, hook, await data, context) ?? data, Promise.resolve(data))

    data = await this.trigger
      .hooks
      .findByEvent('transform')
      .reduce(async (data, hook) => await this._hook({}, hook, await data, context) ?? data, Promise.resolve(data))

    return data
  }

  private async _run(azureFunctionContext: AzureFunctionContext, ...args: unknown[]) {
    await wait.cleaning()

    const context = Object.assign(
      new this.trigger.Context(azureFunctionContext, ...args),
      { runner: this }
    )

    try {
      await this._initialize(context)

      return await context.success(
        await this._transform(
          await this.run(context),
          context
        )
      )
    } catch (error) {
      await this._error(error, context)

      const maybeHandledError = await this._handleError(error, context)

      if (maybeHandledError !== undefined)

        return await context.handledError(maybeHandledError)

      return await context.unhandledError(error)
    } finally {
      await this._destroy(context)
    }
  }

  public toAzureFunction() {
    return async (azureFunctionContext: AzureFunctionContext, ...args: unknown[]) => {
      return await this._run(azureFunctionContext, ...args)
    }
  }
}

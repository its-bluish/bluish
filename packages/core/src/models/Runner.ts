import { AsynchronousEventEmitter } from 'ts-asynchronous-event-emitter'

import { singletonify } from '../tools/singletonify.js'
import { type ConstructorOf, type PromiseLikeToo } from '../typings/helpers.js'
import { type Application } from './Application.js'
import { type Context } from './Context.js'
import { getSourceMetadata } from '../tools/getSourceMetadata.js'
import { MiddlewareHelper } from '../helpers/MiddlewareHelper.js'
import { type Middleware } from './Middleware.js'
import { BeforeRunEvent } from './events/BeforeRunEvent.js'
import { RunFinishEvent } from './events/RunFinishEvent.js'
import { RunErrorEvent } from './events/RunErrorEvent.js'
import { AfterRunEvent } from './events/AfterRunEvent.js'
import { type SourceTriggerMetadata } from './SourceTriggerMetadata.js'

export abstract class Runner<
  TPropertyKey extends string,
  TTarget extends {
    [K in TPropertyKey]: (...args: any[]) => PromiseLikeToo<unknown>
  },
  TContext extends Context,
> extends AsynchronousEventEmitter<
  BeforeRunEvent | AfterRunEvent | RunErrorEvent | RunFinishEvent
> {
  private static readonly emitter = new AsynchronousEventEmitter()

  public readonly application: Application | null = null
  public readonly target: TTarget
  public readonly metadata: SourceTriggerMetadata
  public readonly middlewares: Array<Middleware | null>

  constructor(
    public Target: ConstructorOf<TTarget, [], false>,
    public propertyKey: TPropertyKey,
    public Application: ConstructorOf<Application, [], false> | null = null,
  ) {
    super()

    this.metadata =
      getSourceMetadata(Target).getSourceTriggerMetadata(propertyKey)

    if (Application) this.application = singletonify(Application)

    this.target = singletonify(Target)
    this.middlewares = [
      ...(this.application ? [this.application] : []),
      ...this.metadata.sourceMetadata.middlewares,
      ...this.metadata.middlewares,
    ]

    this.on({
      async 'before-run'(event) {
        await MiddlewareHelper.beforeRun(this.middlewares, event)
      },
      async 'after-run'(event) {
        await MiddlewareHelper.afterRun(this.middlewares, event)
      },
      async 'run-error'(event) {
        await MiddlewareHelper.runError(this.middlewares, event)
      },
      async 'run-finish'(event) {
        await MiddlewareHelper.finishRun(this.middlewares, event)
      },
    })
  }

  public async run(context: Context): Promise<unknown> {
    try {
      await MiddlewareHelper.initialize(this.middlewares)

      const beforeRunEvent = await this.emit(new BeforeRunEvent(this, context))

      if (beforeRunEvent.defaultPrevented) return beforeRunEvent.breakResult

      const payload = await this.target[this.propertyKey](
        ...(await Promise.all(
          this.metadata.parameters.map(parameter => parameter(context)),
        )),
      )

      const afterRunEvent = await this.emit(
        new AfterRunEvent(payload, this, context),
      )

      return afterRunEvent.target
    } catch (error) {
      const runErrorEvent = await this.emit(
        new RunErrorEvent(error, this, context),
      )

      if (!runErrorEvent.defaultPrevented) throw runErrorEvent.error

      return runErrorEvent.treatResult
    } finally {
      await this.emit(new RunFinishEvent(this, context))
    }
  }

  public abstract toContext(...args: any[]): TContext | Promise<TContext>

  public abstract toReturn(payload: unknown, context: TContext): unknown

  public async handle(...args: any[]): Promise<unknown> {
    const context = await this.toContext(...args)

    const payload = await this.run(context)

    return this.toReturn(payload, context)
  }

  public toHandle() {
    return async (...args: any[]) => await this.handle(...args)
  }
}

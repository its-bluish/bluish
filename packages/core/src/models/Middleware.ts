import { type ConstructorOf, type PromiseLikeToo } from '../typings/helpers.js'
import { type Context } from './Context.js'
import { type AfterRunEvent } from './events/AfterRunEvent.js'
import { type BeforeRunEvent } from './events/BeforeRunEvent.js'
import { type RunErrorEvent } from './events/RunErrorEvent.js'
import { type RunFinishEvent } from './events/RunFinishEvent.js'

export abstract class Middleware<TContext extends Context = Context> {
  public readonly use: Middleware[] = []

  public readonly for: Array<ConstructorOf<TContext>> = []

  public onFinish?(event: RunFinishEvent<TContext>): PromiseLikeToo<void>

  public onBefore?(event: BeforeRunEvent<TContext>): PromiseLikeToo<void>

  public onAfter?(event: AfterRunEvent<TContext>): PromiseLikeToo<unknown>

  public onError?(event: RunErrorEvent<TContext>): PromiseLikeToo<unknown>

  public onInitialize?(): PromiseLikeToo<void> {}
}

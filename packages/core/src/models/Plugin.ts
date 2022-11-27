import { PromiseToo } from '../typings/PromiseToo'
import { Context } from './contexts/Context'

export abstract class Plugin {
  public onInitialize?(context: Context): PromiseToo<void>

  public onDestroy?(context: Context): PromiseToo<void>

  public onError?(error: unknown, context: Context): PromiseToo<unknown>

  public onSuccess?(payload: unknown, context: Context): PromiseToo<unknown>
}

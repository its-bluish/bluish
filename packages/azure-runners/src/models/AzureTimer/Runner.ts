import { type HttpRequest, type Context } from '@azure/functions'

import { AzureTimerContext } from './Context.js'
import { AzureRunner } from '../AzureRunner.js'

export class AzureTimerRunner<
  TPropertyKey extends string,
  TTarget extends {
    [K in TPropertyKey]: (...args: any[]) => unknown | Promise<unknown>
  },
> extends AzureRunner<TPropertyKey, TTarget, AzureTimerContext> {
  public toReturn(payload: unknown, context: AzureTimerContext) {}
  public toContext(request: HttpRequest, context: Context): AzureTimerContext {
    return new AzureTimerContext(this, context, request)
  }
}

import { type HttpRequest, type Context } from '@azure/functions'

import { AzureHttpContext } from './Context.js'
import { AzureRunner } from '../AzureRunner.js'

export class AzureHttpRunner<
  TPropertyKey extends string,
  TTarget extends {
    [K in TPropertyKey]: (...args: any[]) => unknown | Promise<unknown>
  },
> extends AzureRunner<TPropertyKey, TTarget, AzureHttpContext> {
  public toReturn(payload: unknown, context: AzureHttpContext) {
    if (typeof payload !== 'object' || !payload) {
      context.azure.res = { body: payload }
      return
    }

    if ('body' in payload && ('status' in payload || 'headers' in payload)) {
      context.azure.res = payload
      return
    }

    context.azure.res = { body: payload }
  }

  public toContext(request: HttpRequest, context: Context): AzureHttpContext {
    return new AzureHttpContext(this, context, request)
  }
}

import { type Context, Runner } from '@bluish/core'

export abstract class AzureRunner<
  TPropertyKey extends string,
  TTarget extends {
    [K in TPropertyKey]: (...args: any[]) => unknown | Promise<unknown>
  },
  TContext extends Context,
> extends Runner<TPropertyKey, TTarget, TContext> {}

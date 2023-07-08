import { type SourceMetadata } from './SourceMetadata.js'
import { type Middleware } from './Middleware.js'
import { type PromiseLikeToo } from '../typings/helpers.js'
import { type Context } from './Context.js'
import { type SourceTriggerBinder } from './SourceTriggerBinder.js'

export class SourceTriggerMetadata {
  public static binders: {
    [K in keyof Bluish.SourceTriggerBinders]?: (
      sourceTriggerMetadata: SourceTriggerMetadata,
    ) => Bluish.SourceTriggerBinders[K]
  } = {}

  public middlewares: Middleware[] = []

  public parameters: Array<(context: Context) => PromiseLikeToo<unknown>> = []

  public binders: {
    [K in keyof Bluish.SourceTriggerBinders]?: Bluish.SourceTriggerBinders[K]
  } = {}

  constructor(
    public sourceMetadata: SourceMetadata,
    public propertyKey: string,
  ) {}

  public useBinder<K extends keyof Bluish.SourceTriggerBinders>(
    binder: K,
  ): Bluish.SourceTriggerBinders[K] {
    return (this.binders[binder] ??= Object.assign(
      // @ts-expect-error: TODO
      SourceTriggerMetadata.binders[binder](this),
      { sourceTriggerMetadata: this },
    )) as any
  }

  [key: string]: unknown
}

declare global {
  namespace Bluish {
    interface SourceTriggerBinders
      extends Record<string, SourceTriggerBinder> {}
  }
}

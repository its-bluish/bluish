import { type Context } from '../models/Context.js'
import { getSourceMetadata } from '../tools/getSourceMetadata.js'
import { type ConstructorOf } from '../typings/helpers.js'

export function Selector(): (
  target: Object,
  propertyKey: string,
  parameterIndex: number,
) => void
export function Selector(
  selector: (context: Context) => unknown,
): (target: Object, propertyKey: string, parameterIndex: number) => void
export function Selector<TContext extends Context>(
  context: ConstructorOf<TContext>,
  selector: (context: TContext) => unknown,
): (target: Object, propertyKey: string, parameterIndex: number) => void
export function Selector<TContext extends Context>(
  maybeContextConstructorOrSelector?:
    | ConstructorOf<TContext>
    | ((context: TContext) => unknown),
  maybeSelector?: (context: TContext) => unknown,
) {
  return (target: Object, propertyKey: string, parameterIndex: number) => {
    if (!maybeContextConstructorOrSelector)
      getSourceMetadata(target.constructor).getSourceTriggerMetadata(
        propertyKey,
      ).parameters[parameterIndex] = context => context
    else if (typeof maybeSelector === 'function')
      getSourceMetadata(target.constructor).getSourceTriggerMetadata(
        propertyKey,
      ).parameters[parameterIndex] = context => {
        if (!(context instanceof maybeContextConstructorOrSelector)) return null
        return maybeSelector(context as TContext)
      }
    else
      getSourceMetadata(target.constructor).getSourceTriggerMetadata(
        propertyKey,
      ).parameters[parameterIndex] = context =>
        (maybeContextConstructorOrSelector as (context: TContext) => unknown)(
          context as TContext,
        )
  }
}

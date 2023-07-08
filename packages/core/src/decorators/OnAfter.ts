import { type Context } from '../models/Context.js'
import { Middleware } from '../models/Middleware.js'
import { type ConstructorOf } from '../typings/helpers.js'
import { Use, type UseDecorator } from './Use.js'

class OnAfterMiddleware<TContext extends Context> extends Middleware<TContext> {
  public for: Array<ConstructorOf<TContext>> = []

  constructor(
    context: ConstructorOf<TContext> | undefined,
    onAfter: NonNullable<Middleware['onAfter']>,
  ) {
    super()
    this.onAfter = onAfter
    if (context) this.for = [context] as Array<ConstructorOf<TContext>>
  }
}

export function OnAfter(
  onAfter: NonNullable<Middleware['onAfter']>,
): UseDecorator
export function OnAfter<TContext extends Context>(
  context: ConstructorOf<TContext>,
  onAfter: NonNullable<Middleware<TContext>['onAfter']>,
): UseDecorator
export function OnAfter<TContext extends Context>(
  contextOrOnAfter:
    | ConstructorOf<TContext>
    | NonNullable<Middleware<TContext>['onAfter']>,
  maybeOnAfter?: NonNullable<Middleware<TContext>['onAfter']>,
): UseDecorator {
  const contextConstructor = (maybeOnAfter ? contextOrOnAfter : undefined) as
    | ConstructorOf<TContext>
    | undefined
  const onAfter = (maybeOnAfter ?? contextOrOnAfter) as NonNullable<
    Middleware<TContext>['onAfter']
  >

  return Use(new OnAfterMiddleware<TContext>(contextConstructor, onAfter))
}

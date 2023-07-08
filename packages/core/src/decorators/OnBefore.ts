import { type Context } from '../models/Context.js'
import { Middleware } from '../models/Middleware.js'
import { type ConstructorOf } from '../typings/helpers.js'
import { Use, type UseDecorator } from './Use.js'

class OnBeforeMiddleware<
  TContext extends Context,
> extends Middleware<TContext> {
  public for: Array<ConstructorOf<TContext>> = []

  constructor(
    context: ConstructorOf<TContext> | undefined,
    onBefore: NonNullable<Middleware['onBefore']>,
  ) {
    super()
    this.onBefore = onBefore
    if (context) this.for = [context] as Array<ConstructorOf<TContext>>
  }
}

export function OnBefore(
  onBefore: NonNullable<Middleware['onBefore']>,
): UseDecorator
export function OnBefore<TContext extends Context>(
  context: ConstructorOf<TContext>,
  onBefore: NonNullable<Middleware<TContext>['onBefore']>,
): UseDecorator
export function OnBefore<TContext extends Context>(
  contextOrOnBefore:
    | ConstructorOf<TContext>
    | NonNullable<Middleware<TContext>['onBefore']>,
  maybeOnBefore?: NonNullable<Middleware<TContext>['onBefore']>,
): UseDecorator {
  const contextConstructor = (maybeOnBefore ? contextOrOnBefore : undefined) as
    | ConstructorOf<TContext>
    | undefined
  const onBefore = (maybeOnBefore ?? contextOrOnBefore) as NonNullable<
    Middleware<TContext>['onBefore']
  >

  return Use(new OnBeforeMiddleware<TContext>(contextConstructor, onBefore))
}

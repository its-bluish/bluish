import { type Context } from '../models/Context.js'
import { Middleware } from '../models/Middleware.js'
import { type ConstructorOf } from '../typings/helpers.js'
import { Use, type UseDecorator } from './Use.js'

class OnFinishMiddleware<
  TContext extends Context,
> extends Middleware<TContext> {
  public for: Array<ConstructorOf<TContext>> = []

  constructor(
    context: ConstructorOf<TContext> | undefined,
    onFinish: NonNullable<Middleware['onFinish']>,
  ) {
    super()
    this.onFinish = onFinish
    if (context) this.for = [context] as Array<ConstructorOf<TContext>>
  }
}

export function OnFinish(
  onFinish: NonNullable<Middleware['onFinish']>,
): UseDecorator
export function OnFinish<TContext extends Context>(
  context: ConstructorOf<TContext>,
  onFinish: NonNullable<Middleware<TContext>['onFinish']>,
): UseDecorator
export function OnFinish<TContext extends Context>(
  contextOrOnFinish:
    | ConstructorOf<TContext>
    | NonNullable<Middleware<TContext>['onFinish']>,
  maybeOnFinish?: NonNullable<Middleware<TContext>['onFinish']>,
): UseDecorator {
  const contextConstructor = (maybeOnFinish ? contextOrOnFinish : undefined) as
    | ConstructorOf<TContext>
    | undefined
  const onFinish = (maybeOnFinish ?? contextOrOnFinish) as NonNullable<
    Middleware<TContext>['onFinish']
  >

  return Use(new OnFinishMiddleware<TContext>(contextConstructor, onFinish))
}

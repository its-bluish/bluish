import { type Context } from '../models/Context.js'
import { Middleware } from '../models/Middleware.js'
import { type ConstructorOf } from '../typings/helpers.js'
import { Use, type UseDecorator } from './Use.js'

class OnErrorMiddleware<TContext extends Context> extends Middleware<TContext> {
  public for: Array<ConstructorOf<TContext>> = []

  constructor(
    context: ConstructorOf<TContext> | undefined,
    onError: NonNullable<Middleware['onError']>,
  ) {
    super()
    this.onError = onError
    if (context) this.for = [context] as Array<ConstructorOf<TContext>>
  }
}

export function OnError(
  onError: NonNullable<Middleware['onError']>,
): UseDecorator
export function OnError<TContext extends Context>(
  context: ConstructorOf<TContext>,
  onError: NonNullable<Middleware<TContext>['onError']>,
): UseDecorator
export function OnError<TContext extends Context>(
  contextOrOnError:
    | ConstructorOf<TContext>
    | NonNullable<Middleware<TContext>['onError']>,
  maybeOnError?: NonNullable<Middleware<TContext>['onError']>,
): UseDecorator {
  const contextConstructor = (maybeOnError ? contextOrOnError : undefined) as
    | ConstructorOf<TContext>
    | undefined
  const onError = (maybeOnError ?? contextOrOnError) as NonNullable<
    Middleware<TContext>['onError']
  >

  return Use(new OnErrorMiddleware<TContext>(contextConstructor, onError))
}

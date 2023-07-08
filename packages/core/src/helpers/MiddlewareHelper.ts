import { type Middleware } from '../models/Middleware.js'
import { type AfterRunEvent } from '../models/events/AfterRunEvent.js'
import { type BeforeRunEvent } from '../models/events/BeforeRunEvent.js'
import { type RunFinishEvent } from '../models/events/RunFinishEvent.js'
import { type RunErrorEvent } from '../models/events/RunErrorEvent.js'
import { type Context } from '../models/Context.js'
import { type ConstructorOf } from '../typings/helpers.js'

export namespace MiddlewareHelper {
  const initialized = new Set<Middleware>()

  function allow(
    context: Context,
    allows: Array<ConstructorOf<Context>>,
  ): boolean {
    if (!allows.length) return true
    return allows.some(constructor => context instanceof constructor)
  }

  export async function initialize(
    middlewares: Array<Middleware | null>,
  ): Promise<void> {
    for (const middleware of middlewares) {
      if (!middleware) continue

      if (initialized.has(middleware)) continue

      await initialize(middleware.use)

      await middleware.onInitialize?.()

      initialized.add(middleware)
    }
  }

  export async function beforeRun(
    middlewares: Array<Middleware | null>,
    event: BeforeRunEvent,
  ): Promise<BeforeRunEvent> {
    for (const middleware of middlewares) {
      if (!middleware) continue

      if (!allow(event.context, middleware.for)) continue

      if (event.stopedImmediatePropagation) break

      await beforeRun(middleware.use, event)

      await middleware.onBefore?.(event)
    }

    return event
  }

  export async function afterRun(
    middlewares: Array<Middleware | null>,
    event: AfterRunEvent,
  ): Promise<AfterRunEvent> {
    for (const middleware of middlewares.reverse()) {
      if (!middleware) continue

      if (event.stopedImmediatePropagation) break

      if (!allow(event.context, middleware.for)) continue

      await middleware.onAfter?.(event)

      await afterRun(middleware.use, event)
    }

    return event
  }

  export async function finishRun(
    middlewares: Array<Middleware | null>,
    event: RunFinishEvent,
  ): Promise<RunFinishEvent> {
    for (const middleware of middlewares.reverse()) {
      if (!middleware) continue

      if (event.stopedImmediatePropagation) break

      if (!allow(event.context, middleware.for)) continue

      await middleware.onFinish?.(event)

      await finishRun(middleware.use, event)
    }

    return event
  }

  export async function runError(
    middlewares: Array<Middleware | null>,
    event: RunErrorEvent,
  ): Promise<RunErrorEvent> {
    for (const middleware of middlewares.reverse()) {
      if (!middleware) continue

      if (event.stopedImmediatePropagation) break

      if (!allow(event.context, middleware.for)) continue

      await middleware.onError?.(event)

      await runError(middleware.use, event)
    }

    return event
  }
}

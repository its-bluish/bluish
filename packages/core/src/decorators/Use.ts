import { type Middleware } from '../models/Middleware.js'
import { getSourceMetadata } from '../tools/getSourceMetadata.js'
import { type ConstructorOf } from '../typings/helpers.js'

export type UseDecorator = (
  target: Function | Object,
  propertyKey?: string,
) => void

export function Use(
  ...middlewares: [Middleware, ...Middleware[]]
): UseDecorator {
  return (target: Function | Object, propertyKey?: string) => {
    const constructor = (
      typeof target === 'function' ? target : target.constructor
    ) as ConstructorOf<any>

    const metadata = getSourceMetadata(constructor)

    if (propertyKey)
      metadata
        .getSourceTriggerMetadata(propertyKey)
        .middlewares.push(...middlewares)
    else metadata.middlewares.push(...middlewares)
  }
}

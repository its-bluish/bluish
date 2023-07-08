import { Route, type RouteOptions } from '../decorators/Route.js'
import { type HttpMethod } from '../typings/HttpMethod.js'

export interface MethodDecorator {
  (target: object, propertyKey: string): void
  (path: string): (target: object, propertyKey: string) => void
  (
    path: string,
    options: RouteOptions,
  ): (target: object, propertyKey: string) => void
}

export function factoryMethodDecorator(method: HttpMethod): MethodDecorator {
  return ((
    targetOrPath: object | string,
    propertyKeyOrOptions?: string | RouteOptions,
  ) => {
    if (typeof targetOrPath === 'object')
      if (typeof propertyKeyOrOptions === 'string') {
        Route(method)(targetOrPath, propertyKeyOrOptions)
        return
      } else throw new Error('TODO')

    if (typeof propertyKeyOrOptions === 'string') throw new Error('TODO')

    return Route(method, targetOrPath, propertyKeyOrOptions)
  }) as MethodDecorator
}

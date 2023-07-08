import { getSourceMetadata, type Middleware } from '@bluish/core'

import { type HttpMethod } from '../typings/HttpMethod.js'

export interface RouteOptions {
  use?: Middleware[]
  onAfter?: Middleware['onAfter']
  onBefore?: Middleware['onBefore']
  onError?: Middleware['onError']
  onFinish?: Middleware['onFinish']
  onInitialize?: Middleware['onInitialize']
}

export function Route(
  methodOrMethods: HttpMethod | HttpMethod[],
  path?: string,
  options?: RouteOptions,
) {
  return (target: Object, propertyKey: string) => {
    const sourceMetadata = getSourceMetadata(
      target.constructor,
    ).getSourceTriggerMetadata(propertyKey)

    const methods = Array.isArray(methodOrMethods)
      ? methodOrMethods
      : [methodOrMethods]

    methods.forEach(method =>
      sourceMetadata.useBinder('http').methods.add(method),
    )

    if (path) sourceMetadata.useBinder('http').path = path
  }
}

import { OnBefore, Selector, type PromiseLikeToo } from '@bluish/core'

import { HttpContext } from '../models/HttpContext.js'

export function Param(
  name: string,
  selector: (value: any) => PromiseLikeToo<any>,
): (target: Function | Object, propertyKey?: string) => void
export function Param(
  name: string,
): (target: Object, propertyKey: string, parameterIndex: number) => void
export function Param(
  name: string,
  selector?: (value: any) => PromiseLikeToo<any>,
): unknown {
  if (typeof selector === 'function')
    return OnBefore(HttpContext, async event => {
      if (event.context.request.params[name] === undefined) return
      event.context.request.params[name] = await selector(
        event.context.request.params[name],
      )
    })

  return Selector(HttpContext, context => context.request.params[name])
}

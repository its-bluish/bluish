import { Selector } from '@bluish/core'

import { HttpContext } from '../models/HttpContext.js'

export function Query(
  target: Object,
  propertyKey: string,
  parameterIndex: number,
): void
export function Query(
  name: string,
): (target: Object, propertyKey: string, parameterIndex: number) => void
export function Query(
  selector: (query: Record<string, unknown>) => unknown,
): (target: Object, propertyKey: string, parameterIndex: number) => void
export function Query(
  targetOrNameOrSelector:
    | Object
    | string
    | ((query: Record<string, unknown>) => unknown),
  propertyKey?: string,
  parameterIndex?: number,
): unknown {
  if (typeof targetOrNameOrSelector === 'object') {
    if (typeof propertyKey !== 'string') throw new Error('TODO')
    if (typeof parameterIndex !== 'number') throw new Error('TODO')

    Selector(HttpContext, context => context.request.query)(
      targetOrNameOrSelector,
      propertyKey,
      parameterIndex,
    )
    return
  }

  if (typeof targetOrNameOrSelector === 'function')
    return Selector(HttpContext, context =>
      targetOrNameOrSelector(context.request.query),
    )

  return Selector(
    HttpContext,
    context => context.request.query[targetOrNameOrSelector],
  )
}

import { Selector } from '@bluish/core'

import { HttpContext } from '../models/HttpContext.js'

export function Params(
  target: Object,
  propertyKey: string,
  parameterIndex: number,
): void
export function Params(
  target: Object,
  propertyKey: string,
  parameterIndex: number,
): void
export function Params(
  selector: (params: Record<string, unknown>) => unknown,
): (target: Object, propertyKey: string, parameterIndex: number) => void
export function Params(
  targetOrSelector: Object | ((params: Record<string, unknown>) => unknown),
  propertyKey?: string,
  parameterIndex?: number,
): unknown {
  if (typeof targetOrSelector === 'function')
    return Selector(HttpContext, context =>
      targetOrSelector(context.request.params),
    )

  if (typeof propertyKey !== 'string') throw new Error('TODO')

  if (typeof parameterIndex !== 'number') throw new Error('TODO')

  Selector(HttpContext, context => context.request.params)(
    targetOrSelector,
    propertyKey,
    parameterIndex,
  )
}

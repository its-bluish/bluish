import { Trigger } from './Trigger'
import { Binding } from '../../models/metadata/Binding'
import { HttpContext, HttpMethod } from '../../models/contexts/HttpContext'
import { Bind } from '../Bind'
import { TriggerDecorator } from '../../typings/decorators'
import { Fn } from '../../typings/helpers'

const HTTP_ROUTE_NORMALIZER_REGEXP = /^\/+|\/+$/

export interface HttpTriggerOptions {
  name?: string
  type?: 'binary' | 'stream' | 'string'
}

export function HttpTrigger(
  route: string,
  methods: HttpMethod | HttpMethod[],
  { type }: HttpTriggerOptions = {},
): TriggerDecorator<Fn> {
  return (target, propertyKey, descriptor) => {
    Trigger({
      Context: HttpContext,
      bindings: [
        new Binding('httpTrigger', 'req', 'in', {
          route: route.replace(HTTP_ROUTE_NORMALIZER_REGEXP, ''),
          methods: Array.isArray(methods) ? methods : [methods],
          dataType: type,
        }),
        new Binding('http', '$return', 'out'),
      ],
    })(target, propertyKey, descriptor)
  }
}

export namespace HttpTrigger {
  export function Get(route: string, options?: HttpTriggerOptions) {
    return HttpTrigger(route, 'get', options)
  }

  export function Post(route: string, options?: HttpTriggerOptions) {
    return HttpTrigger(route, 'post', options)
  }

  export function Patch(route: string, options?: HttpTriggerOptions) {
    return HttpTrigger(route, 'patch', options)
  }

  export function Put(route: string, options?: HttpTriggerOptions) {
    return HttpTrigger(route, 'put', options)
  }

  export function Delete(route: string, options?: HttpTriggerOptions) {
    return HttpTrigger(route, 'delete', options)
  }

  export function Head(route: string, options?: HttpTriggerOptions) {
    return HttpTrigger(route, 'head', options)
  }

  export function Options(route: string, options?: HttpTriggerOptions) {
    return HttpTrigger(route, 'options', options)
  }

  export function Trace(route: string, options?: HttpTriggerOptions) {
    return HttpTrigger(route, 'trace', options)
  }

  export function Connect(route: string, options?: HttpTriggerOptions) {
    return HttpTrigger(route, 'connect', options)
  }

  export function Body(selector?: (body: HttpContext['body'], context: HttpContext) => unknown) {
    if (selector) return Bind((context: HttpContext) => selector(context.body, context))

    return Bind((context: HttpContext) => context.body)
  }

  export function Param(
    nameOrSelector?: string | ((params: HttpContext['params'], context: HttpContext) => unknown),
  ) {
    if (typeof nameOrSelector === 'string')
      return Bind((context: HttpContext) => context.params[nameOrSelector])

    if (typeof nameOrSelector === 'function')
      return Bind((context: HttpContext) => nameOrSelector(context.params, context))

    return Bind((context: HttpContext) => context.params)
  }

  export function Query(
    nameOrSelector?: string | ((query: HttpContext['query'], context: HttpContext) => unknown),
  ) {
    if (typeof nameOrSelector === 'string')
      return Bind((context: HttpContext) => context.query[nameOrSelector])

    if (typeof nameOrSelector === 'function')
      return Bind((context: HttpContext) => nameOrSelector(context.query, context))

    return Bind((context: HttpContext) => context.query)
  }
}

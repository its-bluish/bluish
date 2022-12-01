import { Trigger } from './Trigger'
import { Binding } from '../../models/Binding'
import { HttpContext, HttpMethod } from '../../models/contexts/HttpContext'
import { Bind } from '../Bind'
import { TriggerDecorator, TriggerParamDecorator } from '../../typings/decorators'
import { OnSuccess } from '../OnSuccess'

const HTTP_ROUTE_NORMALIZER_REGEXP = /^\/+|\/+$/

export interface HttpOptions<C extends HttpContext> {
  name?: string
  Context?: new (...args: any[]) => C
  type?: 'binary' | 'stream' | 'string'
}

export function Http<C extends HttpContext>(
  route: string,
  methods: HttpMethod | HttpMethod[],
  { Context = HttpContext as new (...args: any[]) => C, type }: HttpOptions<C> = {},
): TriggerDecorator {
  const bindings = [
    new Binding('httpTrigger', 'req', 'in', {
      route: route.replace(HTTP_ROUTE_NORMALIZER_REGEXP, ''),
      methods: Array.isArray(methods) ? methods : [methods],
      dataType: type,
    }),
    new Binding('http', 'res', 'out'),
  ]

  return Trigger({ Context, bindings })
}

export namespace Http {
  export function Get<C extends HttpContext>(route: string, options?: HttpOptions<C>) {
    return Http<C>(route, 'get', options)
  }

  export function Post<C extends HttpContext>(route: string, options?: HttpOptions<C>) {
    return Http<C>(route, 'post', options)
  }

  export function Patch<C extends HttpContext>(route: string, options?: HttpOptions<C>) {
    return Http<C>(route, 'patch', options)
  }

  export function Put<C extends HttpContext>(route: string, options?: HttpOptions<C>) {
    return Http<C>(route, 'put', options)
  }

  export function Delete<C extends HttpContext>(route: string, options?: HttpOptions<C>) {
    return Http<C>(route, 'delete', options)
  }

  export function Head<C extends HttpContext>(route: string, options?: HttpOptions<C>) {
    return Http<C>(route, 'head', options)
  }

  export function Options<C extends HttpContext>(route: string, options?: HttpOptions<C>) {
    return Http<C>(route, 'options', options)
  }

  export function Trace<C extends HttpContext>(route: string, options?: HttpOptions<C>) {
    return Http<C>(route, 'trace', options)
  }

  export function Connect<C extends HttpContext>(route: string, options?: HttpOptions<C>) {
    return Http<C>(route, 'connect', options)
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

  export function Status<C extends HttpContext>(status: number) {
    return OnSuccess<C>((payload, context) => {
      context.status(status)
    })
  }

  export function Header<C extends HttpContext>(
    name: string,
    value: string | ((context: C, payload: unknown) => string),
  ): TriggerDecorator
  export function Header(name: string): TriggerParamDecorator
  export function Header<C extends HttpContext>(
    name: string,
    maybeValueOrValueFactory?: string | ((context: C, payload: unknown) => string),
  ) {
    if (maybeValueOrValueFactory === void 0)
      return Bind<C>((context) => context.headers[name.toLowerCase()])

    return OnSuccess<C>((payload, context) => {
      const value =
        typeof maybeValueOrValueFactory === 'function'
          ? maybeValueOrValueFactory(context, payload)
          : maybeValueOrValueFactory

      context.setHeader(name, value)
    }) as TriggerDecorator
  }
}

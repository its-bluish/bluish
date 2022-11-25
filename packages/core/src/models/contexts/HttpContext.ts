import { Context, AzureFunctionContext } from './Context'
import { HttpRequest } from '@azure/functions'
import { PromiseToo } from '../../typings/PromiseToo'

export type { HttpRequest as AzureHttpRequest } from '@azure/functions'

export type HttpMethod = Lowercase<
  'GET' | 'POST' | 'DELETE' | 'HEAD' | 'PATCH' | 'PUT' | 'OPTIONS' | 'TRACE' | 'CONNECT'
>

export interface HttpTemplate {
  query: Record<string, unknown>
  params: Record<string, unknown>
  body: unknown
}
export class HttpContext<T extends Partial<HttpTemplate> = {}> extends Context {
  public method: HttpMethod
  public url: string
  public headers: Record<string, string>
  public query: HttpTemplate['query'] & T['query']
  public params: HttpTemplate['params'] & T['params']
  public body: T['body']
  public rawBody: unknown

  constructor(context: AzureFunctionContext, public azureFunctionRequest: HttpRequest) {
    super(context)

    this.method = azureFunctionRequest.method?.toLowerCase() as HttpMethod
    this.url = azureFunctionRequest.url
    this.headers = Object.fromEntries(
      Object.entries(azureFunctionRequest.headers).flatMap(([key, value]) => [
        [key, value],
        [key.toLowerCase(), value],
      ]),
    )
    this.query = azureFunctionRequest.query
    this.params = azureFunctionRequest.params
    this.body = azureFunctionRequest.body as unknown
    this.rawBody = azureFunctionRequest.rawBody
  }

  public success(body: unknown): PromiseToo<unknown> {
    if (!body) return { body }

    if (typeof body !== 'object') return { body }

    if ('status' in body && 'body' in body) return body

    return { body }
  }

  public unhandledError(error: unknown): PromiseToo<unknown> {
    throw error
  }

  public handledError(data: unknown): PromiseToo<unknown> {
    return this.success(data)
  }
}

export interface HttpContext<T extends Partial<HttpTemplate> = {}>
  extends Context,
    Bluish.HttpContext<T> {}

declare global {
  export namespace Bluish {
    export interface HttpContext<T extends Partial<HttpTemplate>> {
      __httpTemplate__: T
    }
  }
}

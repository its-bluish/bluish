/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable object-shorthand */
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

interface Response {
  status?: number
  headers: Record<string, string>
}
export class HttpContext<T extends Partial<HttpTemplate> = {}> extends Context {
  public method: HttpMethod
  public url: string
  public headers: Record<string, string>
  public query: HttpTemplate['query'] & T['query']
  public params: HttpTemplate['params'] & T['params']
  public body: T['body']
  public rawBody: unknown
  private _response: Response = {
    headers: {},
  }

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

  protected buildResponsePayload(payload: unknown) {
    const { status, headers } = this._response

    if (!payload) return { status, headers, body: payload }

    if (typeof payload !== 'object') return { status, headers, body: payload }

    if ('status' in payload && 'body' in payload) {
      return {
        // @ts-ignore
        status: payload.status,
        // @ts-ignore
        body: payload.body,
        headers: {
          ...headers,
          // @ts-ignore
          ...('headers' in payload && typeof payload.headers === 'object' && payload.headers),
        },
      }
    }

    return { status, headers, body: payload }
  }

  public success(payload: unknown): PromiseToo<unknown> {
    this.azureFunctionContext.res = this.buildResponsePayload(payload)
    if (!this.azureFunctionContext.res.status) this.azureFunctionContext.res.status = 200
    return void 0
  }

  public unhandledError(error: unknown): PromiseToo<unknown> {
    throw error
  }

  public handledError(payload: unknown): PromiseToo<unknown> {
    this.azureFunctionContext.res = this.buildResponsePayload(payload)
    if (!this.azureFunctionContext.res.status) this.azureFunctionContext.res.status = 500
    return void 0
  }

  public status(): number
  public status(status: number): this
  public status(status?: number) {
    if (status === void 0) return this._response.status

    this._response.status = status

    return this
  }

  public setHeader(name: string, value: string): this
  public setHeader(name: string, value: string) {
    this._response.headers[name] = value

    return this
  }
}

export interface HttpContext<T extends Partial<HttpTemplate> = {}>
  extends Context,
    Bluish.HttpContext<T> {}

declare global {
  export namespace Bluish {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    export interface HttpContext<T extends Partial<HttpTemplate>> {}
  }
}

/* eslint-disable prefer-named-capture-group */
import {
  HttpMethod,
  HttpRequestHeaders,
  HttpRequestQuery,
  HttpRequestParams,
  HttpRequestUser,
  Form,
} from '@azure/functions'
import { AzureHttpRequest, Binding } from '@bluish/core'
import { URL } from 'url'
import queryString from 'querystring'

export interface MockedAzureHttpRequestOptions {
  method?: Lowercase<HttpMethod>
  headers?: Record<string, string>
  query?: Record<string, unknown> | string
  params?: Record<string, string>
  body?: unknown
}

export class MockedAzureHttpRequest implements AzureHttpRequest {
  private readonly _url = new URL('http://localhost:8080')

  public method: HttpMethod | null
  public url: string
  public headers: HttpRequestHeaders
  public query: HttpRequestQuery
  public params: HttpRequestParams
  public user: HttpRequestUser | null
  public body?: unknown
  public rawBody?: unknown

  constructor(
    bindingIn: Binding,
    { method, headers = {}, params = {}, query = {}, body }: MockedAzureHttpRequestOptions = {},
  ) {
    if (typeof bindingIn.route !== 'string') throw new Error('TODO')

    if (!Array.isArray(bindingIn.methods)) throw new Error('TODO')

    if (typeof bindingIn.methods[0] !== 'string') throw new Error('TODO')

    if (!method) this.method = bindingIn.methods[0].toUpperCase() as HttpMethod
    else if (bindingIn.methods.includes(method)) this.method = method.toUpperCase() as HttpMethod
    else throw new Error('TODO')

    this._url.pathname = bindingIn.route.replace(/{([a-z]+)}/gi, (full, param: string) => {
      if (typeof params[param] !== 'string') throw new Error('TODO')

      return params[param]
    })

    if (typeof query === 'string') {
      this._url.search = query
      this.query = queryString.parse(query) as HttpRequestQuery
    } else {
      this._url.search = queryString.stringify(query as queryString.ParsedUrlQueryInput)
      this.query = query as HttpRequestQuery
    }

    this.url = this._url.toString()
    this.headers = headers
    this.params = params as unknown as Record<string, string>
    this.user = null
    this.body = body
    if (typeof body === 'string') this.rawBody = body
  }

  public parseFormBody(): Form {
    throw new Error('TODO')
  }
}

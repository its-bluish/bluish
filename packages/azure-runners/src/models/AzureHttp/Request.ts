import { type HttpContext, Request, Headers } from '@bluish/http'
import { type HttpRequest } from '@azure/functions'

export class AzureHttpRequest extends Request {
  private readonly _request: HttpRequest

  public params: Record<string, unknown>

  public query: Record<string, unknown>

  public headers: Headers

  public body: unknown

  public url: URL

  constructor(context: HttpContext) {
    super(context)
    this._request = context[0] as HttpRequest

    this.params = this._request.params
    this.query = this._request.query
    this.headers = new Headers(this._request.headers)
    this.body = this._request.body ?? this._request.rawBody
    this.url = new URL(this._request.url)
  }
}

import { HttpContext, type Request, type Response } from '@bluish/http'
import { type Context } from '@azure/functions'

import { AzureHttpRequest } from './Request.js'
import { AzureHttpResponse } from './Response.js'

export class AzureHttpContext extends HttpContext {
  public request: Request = new AzureHttpRequest(this)
  public response: Response = new AzureHttpResponse(this)

  public get azure(): Context {
    return this[1] as Context
  }
}

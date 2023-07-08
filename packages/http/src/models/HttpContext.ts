import { Context } from '@bluish/core'

import { type Request } from './Request.js'
import { type Response } from './Response.js'

export abstract class HttpContext extends Context {
  public abstract request: Request
  public abstract response: Response
}

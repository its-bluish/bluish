import { type RunErrorEvent, Middleware } from '@bluish/core'
import { HttpContext } from '@bluish/http'
import { isHttpError } from 'http-errors'

export class HttpErrorMiddleware extends Middleware<HttpContext> {
  public for = [HttpContext]

  public onError(event: RunErrorEvent<HttpContext>): unknown {
    if (!isHttpError(event.target)) return

    event.treat({
      status: event.target.status,
      body: { message: event.target.message },
    })
  }
}

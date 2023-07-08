import { type RunErrorEvent, Middleware } from '@bluish/core'
import { HttpContext } from '@bluish/http'
import { EntityNotFoundError } from 'typeorm'

export class EntityNotFoundMiddleware extends Middleware<HttpContext> {
  public for = [HttpContext]

  public onError(event: RunErrorEvent<HttpContext>) {
    if (typeof event.target !== 'object') return

    if (!(event.target instanceof EntityNotFoundError)) return

    event.treat({
      status: 404,
      body: { message: 'Not found' },
    })
  }
}

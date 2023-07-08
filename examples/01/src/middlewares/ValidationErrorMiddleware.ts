import { type RunErrorEvent, Middleware } from '@bluish/core'
import { HttpContext } from '@bluish/http'

import { ClassValidatorErrorCollection } from '../helpers/ClassValidatorErrorCollection.js'

export class ValidationErrorMiddleware extends Middleware<HttpContext> {
  public for = [HttpContext]

  public onError(event: RunErrorEvent<HttpContext>) {
    if (typeof event.target !== 'object') return
    if (!(event.target instanceof ClassValidatorErrorCollection)) return

    event.treat({
      status: 400,
      body: { message: 'Bad Request', errors: event.target.toObject() },
    })
  }
}

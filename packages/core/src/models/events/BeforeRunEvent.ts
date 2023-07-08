import { AsynchronousEvent } from 'ts-asynchronous-event-emitter'

import { type Context } from '../Context.js'
import { type Runner } from '../Runner.js'

export class BeforeRunEvent<
  TContext extends Context = Context,
> extends AsynchronousEvent<'before-run', Runner<any, any, any>> {
  public breakResult: unknown

  constructor(
    public runner: Runner<any, any, any>,
    public context: TContext,
  ) {
    super('before-run', runner)
  }

  public break(result: unknown) {
    this.stopImmediatePropagation()
    this.preventDefault()

    this.breakResult = result
  }
}

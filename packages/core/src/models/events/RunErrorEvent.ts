import { AsynchronousEvent } from 'ts-asynchronous-event-emitter'

import { type Context } from '../Context.js'
import { type Runner } from '../Runner.js'

export class RunErrorEvent<
  TContext extends Context = Context,
> extends AsynchronousEvent<'run-error', unknown> {
  public treatResult: unknown

  constructor(
    public error: unknown,
    public runner: Runner<any, any, any>,
    public context: TContext,
  ) {
    super('run-error', error)
  }

  public treat(result: unknown) {
    this.stopImmediatePropagation()
    this.preventDefault()

    this.treatResult = result
  }
}

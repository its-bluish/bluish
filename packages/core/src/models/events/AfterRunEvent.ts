import { AsynchronousEvent } from 'ts-asynchronous-event-emitter'

import { type Context } from '../Context.js'
import { type Runner } from '../Runner.js'

export class AfterRunEvent<
  TContext extends Context = Context,
> extends AsynchronousEvent<'after-run', unknown> {
  constructor(
    public result: unknown,
    public runner: Runner<any, any, any>,
    public context: TContext,
  ) {
    super('after-run', result)
  }
}

import { AsynchronousEvent } from 'ts-asynchronous-event-emitter'

import { type Context } from '../Context.js'
import { type Runner } from '../Runner.js'

export class RunFinishEvent<
  TContext extends Context = Context,
> extends AsynchronousEvent<'run-finish', Runner<any, any, any>> {
  constructor(
    public runner: Runner<any, any, any>,
    public context: TContext,
  ) {
    super('run-finish', runner)
  }
}

import { AsynchronousEvent } from 'ts-asynchronous-event-emitter'

export class ProgressIncrementEvent extends AsynchronousEvent<
  'progress:increment',
  string
> {
  constructor(
    target: string,
    public increment: number = 1,
  ) {
    super('progress:increment', target)
  }
}

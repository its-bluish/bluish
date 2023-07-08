import { AsynchronousEvent } from 'ts-asynchronous-event-emitter'

export class ProgressEndEvent extends AsynchronousEvent<
  'progress:end',
  string
> {
  constructor(target: string) {
    super('progress:end', target)
  }
}

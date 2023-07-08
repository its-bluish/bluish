import { AsynchronousEvent } from 'ts-asynchronous-event-emitter'

export class ReadyEvent extends AsynchronousEvent<'ready', never> {
  constructor() {
    super('ready')
  }
}

import { AsynchronousEvent } from 'ts-asynchronous-event-emitter'

export class LogTextEvent extends AsynchronousEvent<'log', string> {
  constructor(text: string) {
    super('log', text)
  }
}

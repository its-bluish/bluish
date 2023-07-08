import path from 'path'

import { AsynchronousEvent } from 'ts-asynchronous-event-emitter'

export class AddEvent extends AsynchronousEvent<'add', string> {
  public filepath: string

  constructor(
    filepath: string,
    public rootDirectory: string,
  ) {
    super('add', path.join(rootDirectory, filepath))
    this.filepath = filepath
  }
}

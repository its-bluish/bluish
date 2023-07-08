import path from 'path'

import { AsynchronousEvent } from 'ts-asynchronous-event-emitter'

export class ChangeEvent extends AsynchronousEvent<'change', string> {
  public filepath: string

  constructor(
    filepath: string,
    public rootDirectory: string,
  ) {
    super('change', path.join(rootDirectory, filepath))
    this.filepath = filepath
  }
}

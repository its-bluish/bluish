import path from 'path'

import { AsynchronousEvent } from 'ts-asynchronous-event-emitter'

export class UnlinkEvent extends AsynchronousEvent<'unlink', string> {
  public filepath: string

  constructor(
    filepath: string,
    public rootDirectory: string,
  ) {
    super('unlink', path.join(rootDirectory, filepath))
    this.filepath = filepath
  }
}

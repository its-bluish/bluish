import { randomUUID } from 'crypto'

import { AsynchronousEventEmitter } from 'ts-asynchronous-event-emitter'

import { type LogTextEvent } from './LogTextEvent.js'
import { type ProgressStartEvent } from './ProgressStartEvent.js'
import { type ProgressEndEvent } from './ProgressEndEvent.js'
import { type ProgressIncrementEvent } from './ProgressIncrementEvent.js'
import { type Configuration } from '../Configuration.js'

export interface ServerConfiguration {
  outputDirectory: string
  sourceDirectory: string
}

export abstract class Server extends AsynchronousEventEmitter<
  LogTextEvent | ProgressStartEvent | ProgressIncrementEvent | ProgressEndEvent
> {
  public readonly id = randomUUID()

  public abstract readonly name: string

  public readonly configuration!: Configuration

  public abstract start(): void | Promise<void>

  public abstract stop(): void | Promise<void>
}

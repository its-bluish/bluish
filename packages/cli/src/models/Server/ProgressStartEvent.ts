import crypto from 'crypto'

import { AsynchronousEvent } from 'ts-asynchronous-event-emitter'

export interface ProgressStartEventConfiguration {
  total: number
  initWith?: number
  identifier?: string
  label?: (current: number, total: number) => string
}

export class ProgressStartEvent extends AsynchronousEvent<
  'progress:start',
  null
> {
  public readonly identifier: string
  public readonly initWith: number
  public readonly total: number
  public readonly label: (current: number, total: number) => string

  constructor({
    total,
    identifier = crypto.randomUUID(),
    initWith = 0,
    label = (current, total) => `${this.identifier} [${current}/${total}]`,
  }: ProgressStartEventConfiguration) {
    super('progress:start', null)

    this.total = total
    this.identifier = identifier
    this.initWith = initWith
    this.label = label
  }
}

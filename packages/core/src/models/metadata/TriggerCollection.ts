import { Metadata } from '.'
import { wait } from '../../tools/wait'
import { Collection } from '../Collection'
import { Trigger } from './Trigger'

export class TriggerCollection extends Collection<Trigger> {
  constructor(public metadata: Metadata) {
    super()
  }

  protected override beforeAdd(item: Trigger): void {
    Object.assign(item, { metadata: this.metadata })
  }

  protected override afterAdd(): void {
    wait.cast(this.metadata)
  }

  public findOneByPropertyOrFail(property: string) {
    const trigger = this.toArray().find((trigger) => trigger.property === property)

    if (!trigger) throw new Error('TODO')

    return trigger
  }

  public hasTriggerWithProperty(property: string) {
    return this.toArray().some((trigger) => trigger.property === property)
  }
}

import { Source } from './Source'
import { Collection } from '../helpers/Collection'
import { TriggerConfiguration } from './TriggerConfiguration'
import { CoreEmitter } from '../helpers/CoreEmitter'

export class TriggerConfigurationCollection extends Collection<TriggerConfiguration> {
  constructor(public source: Source) {
    super()
  }

  protected override beforeAdd(triggerConfiguration: TriggerConfiguration): void {
    Object.assign(triggerConfiguration, { source: this.source })
  }

  protected override afterAdd(triggerConfiguration: TriggerConfiguration): void {
    CoreEmitter.emit('trigger-configuration', triggerConfiguration)
  }

  public findOneByPropertyOrFail(property: string) {
    const trigger = this.array.find((trigger) => trigger.property === property)

    if (!trigger)
      throw new Error(
        `Unable to find trigger by property '${property}' in '${this.source.target.name}' source`,
      )

    return trigger
  }

  public hasTriggerWithProperty(property: string) {
    return this.array.some((trigger) => trigger.property === property)
  }
}

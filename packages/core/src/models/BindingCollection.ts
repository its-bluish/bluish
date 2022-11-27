import { Collection } from '../helpers/Collection'
import { Binding } from './Binding'
import { TriggerConfiguration } from './TriggerConfiguration'

export class BindingCollection extends Collection<Binding> {
  constructor(public trigger: TriggerConfiguration) {
    super()
  }

  protected override beforeAdd(item: Binding): void {
    Object.assign(item, { trigger: this.trigger })
  }

  public toAzureFunctionConfiguration() {
    return this.toArray().map((binding) => binding.toAzureFunctionConfiguration())
  }
}

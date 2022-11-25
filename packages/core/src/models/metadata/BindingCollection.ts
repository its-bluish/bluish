import { Collection } from '../Collection'
import { Binding } from './Binding'
import { Trigger } from './Trigger'

export class BindingCollection extends Collection<Binding> {
  constructor(public trigger: Trigger) {
    super()
  }

  protected override beforeAdd(item: Binding): void {
    Object.assign(item, { trigger: this.trigger })
  }

  public toAzureFunctionConfiguration() {
    return this.toArray().map((binding) => binding.toAzureFunctionConfiguration())
  }
}

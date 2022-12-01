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

  public findByDirection(direction: 'in' | 'out') {
    return this.array.filter((binding) => binding.direction === direction)
  }

  public findOneByDirection(direction: 'in' | 'out') {
    return this.array.find((binding) => binding.direction === direction) ?? null
  }

  public findOneByDirectionOrFail(direction: 'in' | 'out') {
    const binding = this.findOneByDirection(direction)

    if (!binding) throw new Error('TODO')

    return binding
  }
}

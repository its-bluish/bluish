import { Collection } from '../helpers/Collection'
import { Context } from './contexts/Context'
import { Arg } from './Arg'
import { TriggerConfiguration } from './TriggerConfiguration'

export class ArgCollection<C extends Context> extends Collection<Arg<C>> {
  constructor(protected trigger: TriggerConfiguration) {
    super()
  }

  protected beforeAdd(item: Arg<C>): void {
    Object.assign(item, { trigger: this.trigger })
  }

  public async toArguments(context: C) {
    return Promise.all(this.array.map((arg) => arg.factory(context)))
  }
}

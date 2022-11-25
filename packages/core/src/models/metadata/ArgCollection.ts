import { Collection } from '../Collection'
import { Context } from '../contexts/Context'
import { Arg } from './Arg'
import { Trigger } from './Trigger'

export class ArgCollection<C extends Context> extends Collection<Arg<C>> {
  constructor(protected trigger: Trigger) {
    super()
  }

  protected beforeAdd(item: Arg<C>): void {
    Object.assign(item, { trigger: this.trigger })
  }

  public async toArguments(context: C) {
    return Promise.all(this.toArray().map((arg) => arg.factory(context)))
  }
}

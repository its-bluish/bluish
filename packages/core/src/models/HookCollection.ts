import { Collection } from '../helpers/Collection'
import { Hook } from './Hook'

export class HookCollection extends Collection<Hook> {
  public findByEvent(event: string) {
    return this.array.filter((hook) => hook.event === event)
  }
}

import { Collection } from '../Collection'
import { Hook } from './Hook'

export class HookCollection extends Collection<Hook> {
  public findByEvent(event: string) {
    return this.toArray().filter((hook) => hook.event === event)
  }
}

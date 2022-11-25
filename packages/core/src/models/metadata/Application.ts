import { wait } from '../../tools/wait'
import { Host } from '../Host'
import { HookCollection } from './HookCollection'
import { PluginCollection } from './PluginCollection'

global.bluishApplicationMetadata = null

export class ApplicationMetadata {
  public static has() {
    return !!globalThis.bluishApplicationMetadata
  }

  public static get() {
    return globalThis.bluishApplicationMetadata ?? null
  }

  public static isSame(target: Function | Object) {
    const constructor = typeof target === 'function' ? target : target.constructor

    return constructor === globalThis.bluishApplicationMetadata?.target
  }

  public static set(target: Function | Object | null): ApplicationMetadata {
    if (target === null) return new this(null as unknown as Function)

    if (typeof target !== 'function') return this.set(target.constructor)

    if (globalThis.bluishApplicationMetadata?.target !== target) {
      const applicationMetadata: ApplicationMetadata = new this(target)

      globalThis.bluishApplicationMetadata = applicationMetadata

      wait.cast(applicationMetadata)
    }

    return globalThis.bluishApplicationMetadata
  }

  public hooks = new HookCollection()

  public plugins = new PluginCollection()

  public host = new Host()

  protected constructor(public target: Function) {
    wait.cast(this)
  }
}

declare global {
  // eslint-disable-next-line no-inner-declarations, vars-on-top, no-var
  var bluishApplicationMetadata: ApplicationMetadata | null
}

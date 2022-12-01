/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
import { Host } from './Host'
import { HookCollection } from './HookCollection'
import { PluginCollection } from './PluginCollection'
import { CoreEmitter } from '../helpers/CoreEmitter'

global.bluishApplicationConfiguration = null

export class ApplicationConfiguration {
  public static has() {
    return !!globalThis.bluishApplicationConfiguration
  }

  public static get() {
    return globalThis.bluishApplicationConfiguration ?? null
  }

  public static isSame(target: Function | Object) {
    const constructor = typeof target === 'function' ? target : target.constructor

    return constructor === globalThis.bluishApplicationConfiguration?.target
  }

  public static set(target: Function | Object | null): ApplicationConfiguration {
    if (target === null) return new this(null as unknown as Function)

    if (typeof target !== 'function') return this.set(target.constructor)

    if (globalThis.bluishApplicationConfiguration?.target !== target) {
      const applicationConfiguration: ApplicationConfiguration = new this(target)

      // @ts-ignore
      globalThis.bluishApplicationConfiguration = applicationConfiguration

      CoreEmitter.emit('application-configuration', applicationConfiguration)
    }

    // @ts-ignore
    return globalThis.bluishApplicationConfiguration
  }

  public hooks = new HookCollection()

  public plugins = new PluginCollection()

  public host = new Host()

  protected constructor(public target: Function) {}
}

declare global {
  // @ts-ignore
  // eslint-disable-next-line no-inner-declarations, vars-on-top, no-var
  var bluishApplicationConfiguration: ApplicationConfiguration | null
}

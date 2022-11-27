/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CoreEmitter } from '../helpers/CoreEmitter'
import { getDecoratedFilePath } from '../tools/getDecoratedFilePath'
import { HookCollection } from './HookCollection'
import { PluginCollection } from './PluginCollection'
import { TriggerConfigurationCollection } from './TriggerConfigurationCollection'

export class Source {
  private static get _sources() {
    return (globalThis.bluishSources ??= new Map<Function, Source>())
  }

  public static get(target: Function | Object): Source | null {
    if (typeof target !== 'function') return this.get(target.constructor)

    return this._sources.get(target) ?? null
  }

  public static getOrCreate(target: Function | Object): Source {
    if (typeof target !== 'function') return this.getOrCreate(target.constructor)

    if (this._sources.has(target)) return this._sources.get(target)!

    const source = new Source(target)

    this._sources.set(target, source)

    CoreEmitter.emit('source', source)

    return source
  }

  public static getOrFail(target: Function | Object) {
    const source = this.get(target)

    if (!source) throw new Error('TODO')

    return source
  }

  public triggers = new TriggerConfigurationCollection(this)

  public hooks = new HookCollection()

  public plugins = new PluginCollection()

  public classFilePath = getDecoratedFilePath(Source)

  constructor(public target: Function) {}
}

declare global {
  // eslint-disable-next-line no-inner-declarations, vars-on-top, no-var
  var bluishSources: Map<Function, Source> | undefined
}

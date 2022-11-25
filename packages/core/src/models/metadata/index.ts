import { getDecoratedFilePath } from '../../tools/getDecoratedFilePath'
import { wait } from '../../tools/wait'
import { HookCollection } from './HookCollection'
import { PluginCollection } from './PluginCollection'
import { TriggerCollection } from './TriggerCollection'

export class Metadata {
  private static get _metadata() {
    return (globalThis.bluishMetadataCollection ??= new Map<Function, Metadata>())
  }

  public static load(target: Function | Object, force: true): Metadata
  public static load(target: Function | Object, force?: boolean): Metadata | null
  public static load(target: Function | Object, force?: boolean): Metadata | null {
    if (typeof target !== 'function') return this.load(target.constructor, force)

    if (!this._metadata.has(target) && force) {
      const metadata = new Metadata(target)

      this._metadata.set(target, metadata)

      wait.cast(metadata)
    }

    return this._metadata.get(target) ?? null
  }

  public static loadOrFail(target: Function | Object) {
    const metadata = this.load(target)

    if (!metadata) throw new Error('TODO')

    return metadata
  }

  public triggers = new TriggerCollection(this)

  public hooks = new HookCollection()

  public plugins = new PluginCollection()

  public classFilePath = getDecoratedFilePath(Metadata)

  constructor(public target: Function) {}
}

declare global {
  // eslint-disable-next-line no-inner-declarations, vars-on-top, no-var
  var bluishMetadataCollection: Map<Function, Metadata> | undefined
}

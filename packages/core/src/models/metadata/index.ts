import { getDecoratedFilePath } from "../../tools/getDecoratedFilePath";
import { wait } from "../../tools/wait";
import { HookCollection } from "./HookCollection";
import { PluginCollection } from "./PluginCollection";
import { TriggerCollection } from "./TriggerCollection";

if (!globalThis.bluishMetadataCollection)

  globalThis.bluishMetadataCollection = new Map<Function, Metadata>()

declare global {
  var bluishMetadataCollection: Map<Function, Metadata>;
}

export class Metadata {
  private static readonly _metadata = globalThis.bluishMetadataCollection

  public static load(target: Function | Object, force: true): Metadata
  public static load(target: Function | Object, force?: false): Metadata | null
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

    if (!metadata) throw new Error("TODO");
    
    return metadata
  }

  public triggers = new TriggerCollection(this)

  public hooks = new HookCollection()

  public plugins = new PluginCollection()

  /** TODO: Maybe switch place of decorator */
  public classFilePath = getDecoratedFilePath(Metadata)

  constructor(public target: Function) {}
}

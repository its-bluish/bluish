import { BindingCollection } from './BindingCollection'
import { Source } from './Source'
import { HookCollection } from './HookCollection'
import { PluginCollection } from './PluginCollection'
import { Context as ContextClass } from './contexts/Context'
import { ArgCollection } from './ArgCollection'

export class TriggerConfiguration {
  public bindings = new BindingCollection(this)

  public args = new ArgCollection(this)

  public hooks = new HookCollection()

  public plugins = new PluginCollection()

  public source!: Source

  public runner = '@bluish/core'

  constructor(
    public Context: new (...args: any[]) => ContextClass,
    public name: string,
    public property: string,
  ) {}

  public toAzureFunctionConfiguration() {
    return {
      bindings: this.bindings.toAzureFunctionConfiguration(),
    }
  }
}

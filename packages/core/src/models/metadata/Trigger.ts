import { BindingCollection } from './BindingCollection'
import { Metadata } from '.'
import { HookCollection } from './HookCollection'
import { PluginCollection } from './PluginCollection'
import { Context as ContextClass } from '../contexts/Context'
import { ArgCollection } from './ArgCollection'

export class Trigger {
  public bindings = new BindingCollection(this)

  public args = new ArgCollection(this)

  public hooks = new HookCollection()

  public plugins = new PluginCollection()

  public metadata!: Metadata

  public runner = 'core'

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

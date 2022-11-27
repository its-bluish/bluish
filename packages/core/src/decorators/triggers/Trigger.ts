import { Binding } from '../../models/Binding'
import { Source } from '../../models/Source'
import { TriggerConfiguration } from '../../models/TriggerConfiguration'
import { Context } from '../../models/contexts/Context'
import { TriggerDecorator } from '../../typings/decorators'

type TriggerConstructor<C extends Context> = new (
  ContextConstructor: new (...args: any[]) => C,
  name: string,
  property: string,
) => TriggerConfiguration

export interface TriggerOptions<C extends Context> {
  name?: string
  bindings?: Binding[]
  TriggerConfiguration?: TriggerConstructor<C>
  Context: new (...args: any[]) => C
}

export function Trigger<C extends Context>({
  Context: ContextConstructor,
  TriggerConfiguration: TriggerConfigurationConstructor = TriggerConfiguration,
  name,
  bindings = [],
}: TriggerOptions<C>): TriggerDecorator {
  return (target, propertyKey) => {
    Source.getOrCreate(target)
      .triggers.push(
        new TriggerConfigurationConstructor(
          ContextConstructor,
          name ?? target.constructor.name,
          propertyKey,
        ),
      )
      .bindings.push(...bindings)
  }
}

import { Binding } from '../../models/metadata/Binding'
import { Metadata } from '../../models/metadata'
import { Trigger as TriggerMetadata } from '../../models/metadata/Trigger'
import { Context } from '../../models/contexts/Context'
import { TriggerDecorator } from '../../typings/decorators'
import { Fn } from '../../typings/helpers'

type TriggerConstructor<C extends Context> = new (
  ContextConstructor: new (...args: any[]) => C,
  name: string,
  property: string,
) => TriggerMetadata

export interface TriggerOptions<C extends Context> {
  name?: string
  bindings?: Binding[]
  Trigger?: TriggerConstructor<C>
  Context: new (...args: any[]) => C
}

export function Trigger<C extends Context>({
  Context: ContextConstructor,
  Trigger: TriggerConstructor = TriggerMetadata,
  name,
  bindings = [],
}: TriggerOptions<C>): TriggerDecorator<Fn> {
  return (target, propertyKey) => {
    Metadata.load(target.constructor, true)
      .triggers.push(
        new TriggerConstructor(ContextConstructor, name ?? target.constructor.name, propertyKey),
      )
      .bindings.push(...bindings)
  }
}

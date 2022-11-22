import { Binding } from "../../models/metadata/Binding";
import { Metadata } from "../../models/metadata";
import { Trigger as TriggerMetadata } from "../../models/metadata/Trigger";
import { Context } from "../../models/contexts/Context";

export interface TriggerOptions {
  name?: string
  bindings?: Binding[]
  Trigger?: new (Context: new (...args: any[]) => Context, name: string, property: string) => TriggerMetadata
  Context: new (...args: any[]) => Context
}

export type TriggerHandler = (...args: any[]) => any

export const Trigger = ({ Context, Trigger = TriggerMetadata, name, bindings = [] }: TriggerOptions) => {
  return (target: Object, propertyKey: string, descriptor?: TypedPropertyDescriptor<TriggerHandler>) => {
    Metadata.load(target.constructor, true)
      .triggers
      .push(new Trigger(Context, name ?? target.constructor.name, propertyKey))
      .bindings
      .push(...bindings)
  }
}

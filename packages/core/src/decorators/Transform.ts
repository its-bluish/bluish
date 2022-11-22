import { Context } from "../models/contexts/Context";
import { Metadata } from "../models/metadata";
import { Hook } from "../models/metadata/Hook";
import { wait } from "../tools/wait";
import { PromiseToo } from "../typings/PromiseToo";
import { TriggerHandler } from "./triggers/Trigger";

export interface Transform {
  (): (target: Object, property: string) => void
  (fn: (data: unknown, context: Context) => PromiseToo<unknown>):
    <T extends TriggerHandler>(target: Function | Object, property?: string, descriptor?: TypedPropertyDescriptor<T>) => void
}

export const Transform: Transform = (maybeFn?: (data: unknown, context: Context) => PromiseToo<unknown>) => {
  return <T extends TriggerHandler>(target: Function | Object, property?: string, descriptor?: TypedPropertyDescriptor<T>) => {
    if (maybeFn)

      if (property) wait.any(target, property)
        .then(metadata => {
          if (!(metadata instanceof Metadata)) throw new Error('TODO');
          return metadata
        })
        .then(metadata => {
          metadata.triggers
            .findOneByPropertyOrFail(property)
            .hooks
            .push(new Hook('transform', maybeFn))
        })

      else wait.any(target)
        .then(metadata => metadata.hooks.push(new Hook('transform', maybeFn)))

    else if (!property) throw new Error('TODO');

    else wait.any(target)
      .then(metadata => metadata.hooks.push(new Hook('transform', property)))
  }
}

import { Context } from "../models/contexts/Context";
import { Metadata } from "../models/metadata";
import { Hook } from "../models/metadata/Hook";
import { wait } from "../tools/wait";
import { PromiseToo } from "../typings/PromiseToo";
import { TriggerHandler } from "./triggers/Trigger";

export function ErrorHandler(): (target: Object, property: string, descriptor: TypedPropertyDescriptor<TriggerHandler>) => void
export function ErrorHandler<C extends Context = Context>(fn: (error: unknown, context: C) => PromiseToo<unknown>):
  (target: Object, property?: string, descriptor?: TypedPropertyDescriptor<TriggerHandler>) => void
export function ErrorHandler(maybeFn?: (error: unknown, context: Context) => PromiseToo<unknown>) {
  return (target: Object, property?: string, descriptor?: TypedPropertyDescriptor<TriggerHandler>) => {
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
            .push(new Hook('error-handler', maybeFn))
        })

      else wait.any(target)
        .then(metadata => metadata.hooks.push(new Hook('error-handler', maybeFn)))

    else if (!property) throw new Error('TODO');

    else wait.any(target)
      .then(metadata => metadata.hooks.push(new Hook('error-handler', property)))
  }
}

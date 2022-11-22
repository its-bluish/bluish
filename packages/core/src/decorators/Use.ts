import { Metadata } from "../models/metadata";
import { Plugin } from "../models/Plugin";
import { wait } from "../tools/wait";
import { TriggerHandler } from "./triggers/Trigger";

export const Use = (plugin: Plugin) => {
  return <T extends TriggerHandler>(target: Function | Object, property?: string, descriptor?: TypedPropertyDescriptor<T>) => {
    if (property) wait.any(target, property)
      .then(metadata => {
        if (!(metadata instanceof Metadata)) throw new Error('TODO');
        return metadata
      })
      .then(metadata => metadata.triggers.findOneByPropertyOrFail(property).plugins.push(plugin))

    else wait.any(target)
      .then(metadata => metadata.plugins.push(plugin))
  }
}

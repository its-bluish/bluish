import { Metadata } from '../models/metadata'
import { Plugin } from '../models/Plugin'
import { wait } from '../tools/wait'
import { Fn } from '../typings/helpers'

export type UseDecorator = (
  target: Function | Object,
  property?: string,
  descriptor?: TypedPropertyDescriptor<Fn>,
) => void

export function Use(plugin: Plugin): UseDecorator {
  return (target: Function | Object, property?: string) => {
    if (property)
      return void wait
        .any(target, property)
        .then((metadata) => {
          if (!(metadata instanceof Metadata)) throw new Error('TODO')
          return metadata
        })
        .then((metadata) =>
          metadata.triggers.findOneByPropertyOrFail(property).plugins.push(plugin),
        )

    return void wait.any(target).then((metadata) => metadata.plugins.push(plugin))
  }
}

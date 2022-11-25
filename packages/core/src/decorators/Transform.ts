import { Context } from '../models/contexts/Context'
import { Metadata } from '../models/metadata'
import { Hook } from '../models/metadata/Hook'
import { wait } from '../tools/wait'
import { PromiseToo } from '../typings/PromiseToo'
import {
  ApplicationDecorator,
  SiblingTriggerDecorator,
  TriggerDecorator,
  RootTriggerDecorator,
} from '../typings/decorators'

type Callback<C extends Context> = (data: unknown, context: C) => PromiseToo<unknown>

export function Transform<C extends Context>(): SiblingTriggerDecorator<Callback<C>>
export function Transform<C extends Context>(fn: Callback<C>): TriggerDecorator<Callback<C>>
export function Transform<C extends Context>(fn: Callback<C>): ApplicationDecorator
export function Transform<C extends Context>(fn: Callback<C>): RootTriggerDecorator
export function Transform<C extends Context>(fn?: Callback<C>) {
  return (target: Function | Object, property?: string) => {
    if (fn && property)
      return void wait
        .any(target, property)
        .then((metadata) => {
          if (!(metadata instanceof Metadata)) throw new Error('TODO')
          return metadata
        })
        .then((metadata) => {
          metadata.triggers.findOneByPropertyOrFail(property).hooks.push(new Hook('transform', fn))
        })

    if (fn)
      return void wait
        .any(target)
        .then((metadata) => metadata.hooks.push(new Hook('transform', fn)))

    if (!property) throw new Error('TODO')

    return void wait
      .any(target)
      .then((metadata) => metadata.hooks.push(new Hook('transform', property)))
  }
}

import { Context } from '../models/contexts/Context'
import { Metadata } from '../models/metadata'
import { Hook } from '../models/metadata/Hook'
import { wait } from '../tools/wait'
import {
  ApplicationImplementarionDecorator,
  SiblingTriggerDecorator,
  RootTriggerDecorator,
  ApplicationDecorator,
  TriggerDecorator,
} from '../typings/decorators'
import { Fn } from '../typings/helpers'
import { PromiseToo } from '../typings/PromiseToo'

type Callback<C extends Context> = (error: unknown, context: C) => PromiseToo<unknown>

export function ErrorHandler<C extends Context>(): SiblingTriggerDecorator<Callback<C>> &
  ApplicationImplementarionDecorator<Callback<C>>
export function ErrorHandler<C extends Context>(
  fn: Callback<C>,
): RootTriggerDecorator & ApplicationDecorator & TriggerDecorator<Fn>
export function ErrorHandler<C extends Context>(maybeFn?: Callback<C>) {
  return (target: Function | Object, property?: string) => {
    if (maybeFn && property)
      return void wait
        .any(target, property)
        .then((metadata) => {
          if (!(metadata instanceof Metadata)) throw new Error('TODO')
          return metadata
        })
        .then((metadata) => {
          metadata.triggers
            .findOneByPropertyOrFail(property)
            .hooks.push(new Hook('error-handler', maybeFn))
        })

    if (maybeFn)
      return void wait
        .any(target)
        .then((metadata) => metadata.hooks.push(new Hook('error-handler', maybeFn)))

    if (!property) throw new Error('TODO')

    return void wait
      .any(target)
      .then((metadata) => metadata.hooks.push(new Hook('error-handler', property)))
  }
}

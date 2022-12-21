/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import { Hook } from '../models/Hook'
import {
  MethodDecorator,
  SourceDecorator,
  ApplicationDecorator,
  TriggerDecorator,
} from '../typings/decorators'
import { PromiseToo } from '../typings/PromiseToo'
import { waitForTriggerConfiguration } from '../tools/waitForTriggerConfiguration'
import { waitForSourceOrApplicationConfiguration } from '../tools/waitForSourceOrApplicationConfiguration'

type Callback = (...args: any[]) => PromiseToo<unknown>

export type OnDecoratorWithFn = SourceDecorator & ApplicationDecorator & TriggerDecorator
export type OnDecorator<C extends Callback> = MethodDecorator<C>

export function On<C extends Callback>(event: string): OnDecorator<C>
export function On<C extends Callback>(event: string, fn: C): OnDecoratorWithFn
export function On<C extends Callback>(event: string, fn?: C): OnDecorator<C> | OnDecoratorWithFn
export function On<C extends Callback>(event: string, fn?: C) {
  return (target: Function | Object, property?: string) => {
    if (fn && property)
      return waitForTriggerConfiguration(target, property, (triggerConfiguration) => {
        triggerConfiguration.hooks.push(new Hook(event, fn))
      })

    if (!fn && !property)
      throw new Error(
        'To include a hook you need to decorate a method or pass a function as an argument',
      )

    return waitForSourceOrApplicationConfiguration(target, (sourceOrApplicationConfiguration) => {
      sourceOrApplicationConfiguration.hooks.push(new Hook(event, fn ?? property!))
    })
  }
}

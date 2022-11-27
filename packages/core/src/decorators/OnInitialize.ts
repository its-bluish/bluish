import { Context } from '../models/contexts/Context'
import { PromiseToo } from '../typings/PromiseToo'
import { On, OnDecorator, OnDecoratorWithFn } from './On'

export type OnInitializeCallback<C extends Context> = (context: C) => PromiseToo<void>

export function OnInitialize<C extends Context>(): OnDecorator<OnInitializeCallback<C>>
export function OnInitialize<C extends Context>(fn: OnInitializeCallback<C>): OnDecoratorWithFn
export function OnInitialize<C extends Context>(maybeFn?: OnInitializeCallback<C>) {
  return On('initialize', maybeFn)
}

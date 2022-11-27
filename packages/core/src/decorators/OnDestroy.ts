import { Context } from '../models/contexts/Context'
import { PromiseToo } from '../typings/PromiseToo'
import { On, OnDecorator, OnDecoratorWithFn } from './On'

export type OnDestroyCallback<C extends Context> = (context: C) => PromiseToo<void>

export function OnDestroy<C extends Context>(): OnDecorator<OnDestroyCallback<C>>
export function OnDestroy<C extends Context>(fn: OnDestroyCallback<C>): OnDecoratorWithFn
export function OnDestroy<C extends Context>(maybeFn?: OnDestroyCallback<C>) {
  return On('destroy', maybeFn)
}

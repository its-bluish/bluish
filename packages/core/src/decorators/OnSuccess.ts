import { Context } from '../models/contexts/Context'
import { PromiseToo } from '../typings/PromiseToo'
import { On, OnDecorator, OnDecoratorWithFn } from './On'

export type OnSuccessCallback<C extends Context> = (
  payload: unknown,
  context: C,
) => PromiseToo<unknown>

export function OnSuccess<C extends Context>(): OnDecorator<OnSuccessCallback<C>>
export function OnSuccess<C extends Context>(fn: OnSuccessCallback<C>): OnDecoratorWithFn
export function OnSuccess<C extends Context>(maybeFn?: OnSuccessCallback<C>) {
  return On('success', maybeFn)
}

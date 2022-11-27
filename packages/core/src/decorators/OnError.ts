import { Context } from '../models/contexts/Context'
import { PromiseToo } from '../typings/PromiseToo'
import { On, OnDecorator, OnDecoratorWithFn } from './On'

export type OnErrorCallback<C extends Context> = (error: unknown, context: C) => PromiseToo<unknown>

export function OnError<C extends Context>(): OnDecorator<OnErrorCallback<C>>
export function OnError<C extends Context>(fn: OnErrorCallback<C>): OnDecoratorWithFn
export function OnError<C extends Context>(maybeFn?: OnErrorCallback<C>) {
  return On('error', maybeFn)
}

import { Context } from '../models/contexts/Context'
import { PromiseToo } from '../typings/PromiseToo'
import { On } from './On'

export namespace Log {
  export function Error(callback?: (error: unknown, context: Context) => PromiseToo<unknown>) {
    return On('log:error', callback)
  }

  export function Initialize(callback?: (context: Context) => PromiseToo<unknown>) {
    return On('log:initialize', callback)
  }

  export function Success(callback?: (payload: unknown, context: Context) => PromiseToo<unknown>) {
    return On('log:success', callback)
  }

  export function Destroy(callback?: (context: Context) => PromiseToo<unknown>) {
    return On('log:destroy', callback)
  }
}

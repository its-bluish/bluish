import { Context as AzureFunctionContext } from '@azure/functions'
import { Fn } from '../../typings/helpers'
import { PromiseToo } from '../../typings/PromiseToo'
import { Runner } from '../Runner'

export { Context as AzureFunctionContext } from '@azure/functions'

export abstract class Context {
  protected runner!: Runner<string, Record<string, Fn>>

  constructor(public azureFunctionContext: AzureFunctionContext) {}

  public abstract success(data: unknown): PromiseToo<unknown>

  public abstract unhandledError(error: unknown): PromiseToo<unknown>

  public abstract handledError(data: unknown): PromiseToo<unknown>

  public initialize?(): PromiseToo<void>

  public destroy?(): PromiseToo<void>
}

export interface Context extends Bluish.Context {}

declare global {
  export namespace Bluish {
    export interface Context {}
  }
}
